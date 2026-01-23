// src/app/api/stripe/webhook/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export const runtime = "nodejs";

function supabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key, { auth: { persistSession: false } });
}

function getOrderIdFromSession(session: Stripe.Checkout.Session) {
  return (
    session.metadata?.orderId ||
    (typeof session.client_reference_id === "string" ? session.client_reference_id : "") ||
    ""
  );
}

// ✅ 发邮件：默认发给订单 email；你要强制调试就填 EMAIL_TO_OVERRIDE
async function sendPaidEmail(args: {
  orderId: string;
  bookingId: string;
  amountCents: number;
  currency: string;
  toEmail: string;
}) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) throw new Error("missing RESEND_API_KEY");

  const override = process.env.EMAIL_TO_OVERRIDE || "";
  const to = override || args.toEmail;
  if (!to) throw new Error("missing_to_email");

  const amount = (Number(args.amountCents || 0) / 100).toFixed(2);
  const currency = String(args.currency || "usd").toUpperCase();
  const ref = args.orderId.slice(0, 8) + "…" + args.orderId.slice(-6);

  const html = `
  <div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial;line-height:1.6;color:#111">
    <h2 style="margin:0 0 12px;font-weight:600">付款已确认 ✅</h2>
    <p style="margin:0 0 18px">我们已成功收到您的付款，预约已记录。</p>
    <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:12px 0">
      <tr><td style="padding:6px 16px 6px 0;color:#666">参考号</td><td style="padding:6px 0">${ref}</td></tr>
      <tr><td style="padding:6px 16px 6px 0;color:#666">预约号</td><td style="padding:6px 0">${args.bookingId}</td></tr>
      <tr><td style="padding:6px 16px 6px 0;color:#666">金额</td><td style="padding:6px 0">${amount} ${currency}</td></tr>
    </table>
    <p style="margin:18px 0 0;color:#555">如需修改时间或人数，请回到预约页面重新提交（以最新一条为准）。</p>
  </div>`;

  const resend = new Resend(resendKey);
  await resend.emails.send({
    from: "Shijia <onboarding@resend.dev>",
    to,
    subject: "付款已确认｜预约已记录",
    html,
  });
}

export async function POST(req: Request) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeKey || !webhookSecret) {
    return NextResponse.json({ error: "missing_env" }, { status: 500 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "missing_stripe_signature" }, { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    const stripe = new Stripe(stripeKey);
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (e: any) {
    return NextResponse.json(
      { error: "invalid_signature", detail: String(e?.message || e) },
      { status: 400 }
    );
  }

  const supabase = supabaseAdmin();

  // 只处理 checkout session 相关事件
  const isSessionEvent =
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded" ||
    event.type === "checkout.session.expired";

  if (!isSessionEvent) {
    return NextResponse.json({ ok: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const orderId = getOrderIdFromSession(session);

  // 没有 orderId：吞掉，避免 Stripe 重试风暴
  if (!orderId) {
    return NextResponse.json({ ok: true, ignored: true, reason: "no_orderId" }, { status: 200 });
  }

  // ✅ 支付成功：更新订单 + 发邮件（只发一次）
  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    // 1) 先置为 paid（幂等）
    await supabase
      .from("orders")
      .update({
        status: "paid",
        stripe_session_id: session.id,
      })
      .eq("id", orderId);

    // 2) 读取订单，看是否需要发邮件（只发一次）
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("id, status, booking_id, amount_cents, currency, paid_email_sent_at, email")
      .eq("id", orderId)
      .single();

    if (orderErr || !order) {
      // 不给 Stripe 返回 500（否则重试）
      return NextResponse.json({ ok: true, ignored: true, reason: "order_not_found" }, { status: 200 });
    }

    if (String((order as any).status) !== "paid") {
      return NextResponse.json({ ok: true, skipped: true, reason: "not_paid" }, { status: 200 });
    }

    // 已发过邮件：直接返回
    if ((order as any).paid_email_sent_at) {
      return NextResponse.json({ ok: true, skipped: true, reason: "email_already_sent" }, { status: 200 });
    }

    // 订单 email 为空：也不要报错给 Stripe
    const toEmail = String((order as any).email ?? "").trim();
    if (!toEmail && !(process.env.EMAIL_TO_OVERRIDE || "")) {
      return NextResponse.json({ ok: true, skipped: true, reason: "missing_order_email" }, { status: 200 });
    }

    try {
      await sendPaidEmail({
        orderId,
        bookingId: String((order as any).booking_id ?? ""),
        amountCents: Number((order as any).amount_cents ?? 0),
        currency: String((order as any).currency ?? "usd"),
        toEmail,
      });

      // 标记已发，防止重复
      await supabase
        .from("orders")
        .update({ paid_email_sent_at: new Date().toISOString() })
        .eq("id", orderId);
    } catch (e: any) {
      // 邮件失败也不要让 Stripe 重试 webhook（避免重复发）
      return NextResponse.json(
        { ok: true, email_failed: true, detail: String(e?.message ?? e) },
        { status: 200 }
      );
    }

    return NextResponse.json({ ok: true, emailed: true }, { status: 200 });
  }

  // ✅ 会话过期：把 pending 改 canceled
  if (event.type === "checkout.session.expired") {
    await supabase
      .from("orders")
      .update({
        status: "canceled",
        stripe_session_id: session.id,
      })
      .eq("id", orderId)
      .eq("status", "pending");

    return NextResponse.json({ ok: true }, { status: 200 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}