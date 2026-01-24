// src/app/api/stripe/webhook/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin, requireEnv } from "@/lib/supabaseAdmin";
import { sendPaidEmail } from "@/lib/mailer";

export const runtime = "nodejs";

function json(ok: boolean, body: any, status = 200) {
  return NextResponse.json({ ok, ...body }, { status });
}

export async function POST(req: Request) {
  try {
    const stripeSecretKey = requireEnv("STRIPE_SECRET_KEY");
    const webhookSecret = requireEnv("STRIPE_WEBHOOK_SECRET");

    // Stripe SDK：不要显式 apiVersion（你之前就卡在 TS union 上）
    const stripe = new Stripe(stripeSecretKey);

    const sig = req.headers.get("stripe-signature");
    if (!sig) return json(false, { error: "missing_stripe_signature" }, 400);

    const rawBody = await req.text();

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } catch (err: any) {
      return json(false, { error: "invalid_signature", detail: String(err?.message ?? err) }, 400);
    }

    // ✅ 只处理 checkout.session.completed
    if (event.type !== "checkout.session.completed") {
      return json(true, { ignored: true, type: event.type }, 200);
    }

    const session = event.data.object as Stripe.Checkout.Session;

    // ✅ 只允许 payment
    if (session.mode !== "payment") {
      return json(true, { ignored: true, reason: "not_payment_mode", mode: session.mode }, 200);
    }

    const orderId =
      (session.metadata?.orderId as string | undefined)?.trim() ||
      (session.client_reference_id as string | undefined)?.trim() ||
      "";

    if (!orderId) {
      return json(false, { error: "missing_orderId_in_metadata_or_client_reference_id" }, 400);
    }

    const sb = supabaseAdmin();

    // ✅ 核心：状态锁（只能 pending -> paid 一次）
    // 如果更新不到行，说明：已 paid / 已取消 / orderId 不存在 / 重放事件
    const { data: updated, error: updErr } = await sb
      .from("orders")
      .update({
        status: "paid",
        stripe_session_id: session.id,
        paid_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .eq("status", "pending")
      .select("id, status, booking_id, amount_cents, currency, customer_email")
      .single();

    if (updErr) {
      // 如果 order 不存在，updErr 可能是 “No rows returned”
      return json(true, { skipped: true, reason: "not_updated", detail: updErr.message }, 200);
    }

    // 走到这说明：这次 webhook 真正把订单从 pending 改成 paid 了
    // ✅ 发 paid 邮件（mailer 内部做 email_events 幂等：同一 orderId 只发一次）
    const emailRes = await sendPaidEmail({
      orderId: updated.id,
      bookingId: (updated as any).booking_id ?? null,
      amountCents: (updated as any).amount_cents ?? null,
      currency: (updated as any).currency ?? null,
      customerEmail: (updated as any).customer_email ?? null,
    });

    return json(true, { processed: true, orderId, email: emailRes }, 200);
  } catch (e: any) {
    console.error("STRIPE_WEBHOOK_ERROR", e);
    return NextResponse.json(
      { ok: false, error: "server_error", detail: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}