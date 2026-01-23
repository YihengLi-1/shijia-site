// src/app/api/pay/confirm/route.ts
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

// 生产环境建议你把这行留空；调试阶段你想强制都发给自己就填邮箱
const TO_OVERRIDE = "";

export async function POST(req: Request) {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;          // ✅ 也要在 Vercel 配
    const resendKey = process.env.RESEND_API_KEY;             // ✅ 你现在缺的就是这个

    if (!stripeKey) {
      return NextResponse.json({ ok: false, error: "missing STRIPE_SECRET_KEY" }, { status: 500 });
    }
    if (!resendKey) {
      // 不要 throw，避免 build/运行期直接炸
      return NextResponse.json({ ok: false, error: "missing RESEND_API_KEY" }, { status: 500 });
    }

    const body = (await req.json().catch(() => null)) as { orderId?: string; sessionId?: string } | null;
    const orderId = body?.orderId ? String(body.orderId) : "";
    const sessionId = body?.sessionId ? String(body.sessionId) : "";

    if (!orderId) return NextResponse.json({ ok: false, error: "missing_orderId" }, { status: 400 });
    if (!sessionId) return NextResponse.json({ ok: false, error: "missing_sessionId" }, { status: 400 });

    const stripe = new Stripe(stripeKey);

    // 1) 拉 Stripe session，确认支付状态
    let session: Stripe.Checkout.Session | null = null;
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId);
    } catch (e: any) {
      return NextResponse.json(
        { ok: true, status: "pending", reason: "stripe_session_fetch_failed", stripe_error: { message: e?.message, code: e?.code, type: e?.type } },
        { status: 200 }
      );
    }

    const paid =
      (session?.payment_status === "paid") ||
      (session?.status === "complete"); // 保险兜底

    if (!paid) {
      return NextResponse.json({ ok: true, status: "pending", reason: "not_paid_yet" }, { status: 200 });
    }

    // 2) 更新 Supabase 订单：status=paid + stripe_session_id
    const supabase = supabaseAdmin();
    const { data: updated, error: updErr } = await supabase
      .from("orders")
      .update({
        status: "paid",
        stripe_session_id: sessionId,
      })
      .eq("id", orderId)
      .select("id, booking_id, status, name, phone, visit_date, visit_time, party_size, amount_cents, currency")
      .single();

    if (updErr || !updated) {
      return NextResponse.json({ ok: false, error: "order_update_failed", detail: updErr?.message }, { status: 500 });
    }

    // 3) 发邮件（只对 paid 发）
    const resend = new Resend(resendKey);

    const to = TO_OVERRIDE || "yihengli23@gmail.com";
    const amount = Number((updated as any).amount_cents ?? 0) / 100;
    const currency = String((updated as any).currency ?? "usd").toUpperCase();

    const html = `
      <div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial;line-height:1.6">
        <h2 style="margin:0 0 12px">预约支付已确认 ✅</h2>
        <p style="margin:0 0 18px">我们已收到付款，预约已记录。</p>

        <table cellpadding="0" cellspacing="0" style="border-collapse:collapse">
          <tr><td style="padding:6px 12px 6px 0; color:#666">订单号</td><td style="padding:6px 0">${orderId}</td></tr>
          <tr><td style="padding:6px 12px 6px 0; color:#666">预约号</td><td style="padding:6px 0">${String((updated as any).booking_id ?? "")}</td></tr>
          <tr><td style="padding:6px 12px 6px 0; color:#666">姓名</td><td style="padding:6px 0">${String((updated as any).name ?? "")}</td></tr>
          <tr><td style="padding:6px 12px 6px 0; color:#666">电话</td><td style="padding:6px 0">${String((updated as any).phone ?? "")}</td></tr>
          <tr><td style="padding:6px 12px 6px 0; color:#666">日期</td><td style="padding:6px 0">${String((updated as any).visit_date ?? "")}</td></tr>
          <tr><td style="padding:6px 12px 6px 0; color:#666">时间</td><td style="padding:6px 0">${String((updated as any).visit_time ?? "")}</td></tr>
          <tr><td style="padding:6px 12px 6px 0; color:#666">人数</td><td style="padding:6px 0">${String((updated as any).party_size ?? "")}</td></tr>
          <tr><td style="padding:6px 12px 6px 0; color:#666">金额</td><td style="padding:6px 0">${amount.toFixed(2)} ${currency}</td></tr>
        </table>

        <p style="margin:18px 0 0; color:#666; font-size:13px">
          如需改时间/人数，请回到预约页重新提交（以最新一条为准）。
        </p>
      </div>
    `;

    const r = await resend.emails.send({
      from: process.env.RESEND_FROM!,
      to,
      subject: "支付已确认｜预约已记录",
      html,
    });

    return NextResponse.json({ ok: true, status: "paid", emailed: true, to, resend: r }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message ?? e) }, { status: 500 });
  }
}