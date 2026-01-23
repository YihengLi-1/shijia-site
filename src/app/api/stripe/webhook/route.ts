// src/app/api/stripe/webhook/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { sendPaidEmail } from "@/lib/mailer";

export const runtime = "nodejs";

/** Vercel/Next: Stripe webhook 必须用 raw body */
export const dynamic = "force-dynamic";

function must(name: string) {
  const v = (process.env[name] ?? "").trim();
  if (!v) throw new Error(`missing ${name}`);
  return v;
}

function getSupabaseAdmin() {
  const url = must("SUPABASE_URL");
  const key = must("SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(req: Request) {
  try {
    const stripeSecretKey = must("STRIPE_SECRET_KEY");
    const webhookSecret = must("STRIPE_WEBHOOK_SECRET");

    const stripe = new Stripe(stripeSecretKey); // apiVersion 不写，避免 TS 版本对不上
    const sig = req.headers.get("stripe-signature");
    if (!sig) {
      return NextResponse.json({ ok: false, error: "missing_stripe_signature" }, { status: 400 });
    }

    const rawBody = await req.text();

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } catch (err: any) {
      return NextResponse.json(
        { ok: false, error: "invalid_signature", detail: String(err?.message ?? err) },
        { status: 400 }
      );
    }

    // 只处理 checkout.session.completed（你也可以加 payment_intent.succeeded）
    if (event.type !== "checkout.session.completed") {
      return NextResponse.json({ ok: true, ignored: true, type: event.type }, { status: 200 });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    // orderId 取法：metadata.orderId 优先，其次 client_reference_id
    const orderId =
      (session.metadata?.orderId ?? "").trim() ||
      (typeof session.client_reference_id === "string" ? session.client_reference_id.trim() : "");

    if (!orderId) {
      return NextResponse.json({ ok: false, error: "missing_orderId_in_session" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // 1) 把订单标记为 paid（幂等：重复 webhook 不会炸）
    const { data: updated, error: updErr } = await supabase
      .from("orders")
      .update({
        status: "paid",
        stripe_session_id: session.id,
        paid_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .select("id, status")
      .single();

    if (updErr) {
      return NextResponse.json(
        { ok: false, error: "db_update_failed", detail: updErr.message },
        { status: 500 }
      );
    }

    // 2) 发邮件（你 mailer 里自己会用 RESEND_FROM / EMAIL_TO_OVERRIDE 等）
    try {
      await sendPaidEmail({ orderId });
    } catch (mailErr: any) {
      // 邮件失败不阻断 webhook（否则 Stripe 会不停重试）
      return NextResponse.json(
        { ok: true, orderId, paid: true, email: "failed", emailError: String(mailErr?.message ?? mailErr) },
        { status: 200 }
      );
    }

    return NextResponse.json({ ok: true, orderId, paid: true, email: "sent" }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message ?? e) }, { status: 500 });
  }
}