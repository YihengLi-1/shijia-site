// src/app/api/stripe/webhook/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendPaidEmail } from "@/lib/mailer";

export const runtime = "nodejs";

function must(name: string) {
  const v = (process.env[name] || "").trim();
  if (!v) throw new Error(`missing ${name}`);
  return v;
}

export async function POST(req: Request) {
  try {
    const stripeSecretKey = must("STRIPE_SECRET_KEY");
    const webhookSecret = must("STRIPE_WEBHOOK_SECRET");

    const stripe = new Stripe(stripeSecretKey);

    const sig = req.headers.get("stripe-signature");
    if (!sig) return NextResponse.json({ ok: false, error: "missing_stripe_signature" }, { status: 400 });

    const rawBody = await req.text();
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } catch (err: any) {
      return NextResponse.json({ ok: false, error: "invalid_signature", detail: String(err?.message ?? err) }, { status: 400 });
    }

    // 你可以按自己实际使用的支付流改事件类型：
    // - checkout.session.completed（常见）
    // - payment_intent.succeeded
    if (event.type !== "checkout.session.completed" && event.type !== "payment_intent.succeeded") {
      return NextResponse.json({ ok: true, ignored: true, type: event.type }, { status: 200 });
    }

    const sb = supabaseAdmin();

    // 从 event 里拿 orderId：推荐你下单时写到 metadata.orderId
    // checkout.session.completed: event.data.object is Stripe.Checkout.Session
    // payment_intent.succeeded: event.data.object is Stripe.PaymentIntent
    let orderId: string | null = null;

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      orderId = (session.metadata?.orderId || "").trim() || null;
    } else {
      const pi = event.data.object as Stripe.PaymentIntent;
      orderId = (pi.metadata?.orderId || "").trim() || null;
    }

    if (!orderId) {
      // 没 metadata 就没法定位订单，直接返回让你后续补
      return NextResponse.json({ ok: false, error: "missing_orderId_in_metadata" }, { status: 400 });
    }

    // 1) 标记订单 paid（如果已 paid，也无所谓）
    await sb.from("orders").update({ status: "paid" }).eq("id", orderId);

    // 2) 查订单并发邮件（幂等在 sendPaidEmail 里）
    const { data: order } = await sb
      .from("orders")
      .select("id, status, booking_id, amount_cents, currency, customer_email")
      .eq("id", orderId)
      .single();

    if (!order) {
      return NextResponse.json({ ok: false, error: "order_not_found_after_update" }, { status: 404 });
    }

    const mail = await sendPaidEmail({
      orderId: String((order as any).id),
      bookingId: (order as any).booking_id,
      amountCents: (order as any).amount_cents,
      currency: (order as any).currency,
      customerEmail: (order as any).customer_email,
    });

    return NextResponse.json({ ok: true, orderId, mail }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message ?? e) }, { status: 500 });
  }
}