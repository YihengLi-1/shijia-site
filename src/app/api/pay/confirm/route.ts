// src/app/api/pay/confirm/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { sendPaidEmail } from "@/lib/mailer";

export const runtime = "nodejs";

function must(name: string) {
  const v = (process.env[name] || "").trim();
  if (!v) throw new Error(`missing ${name}`);
  return v;
}

async function confirmPaid(params: { orderId: string; sessionId: string }) {
  const orderId = (params.orderId || "").trim();
  const sessionId = (params.sessionId || "").trim();

  if (!orderId) return NextResponse.json({ ok: false, error: "missing_orderId" }, { status: 400 });
  if (!sessionId) return NextResponse.json({ ok: false, error: "missing_sessionId" }, { status: 400 });

  const stripe = new Stripe(must("STRIPE_SECRET_KEY"));
  const sb = getSupabaseAdmin();

  // 1) 拉 Checkout Session
  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["payment_intent"] });
  } catch (e: any) {
    return NextResponse.json(
      {
        ok: true,
        status: "pending",
        reason: "stripe_session_fetch_failed",
        stripe_error: { message: e?.message, code: e?.code, type: e?.type },
      },
      { status: 200 }
    );
  }

  // 2) 判定支付状态
  const paid =
    session.payment_status === "paid" ||
    (typeof session.status === "string" && session.status === "complete");

  if (!paid) {
    return NextResponse.json(
      {
        ok: true,
        status: "pending",
        payment_status: session.payment_status ?? null,
        session_status: session.status ?? null,
      },
      { status: 200 }
    );
  }

  // 3) 订单落库：标记 paid（幂等）
  const { data: order, error: orderErr } = await sb
    .from("orders")
    .select("id, status, booking_id, amount_cents, currency, customer_email")
    .eq("id", orderId)
    .single();

  if (orderErr || !order) {
    return NextResponse.json({ ok: false, error: "order_not_found", detail: orderErr?.message }, { status: 404 });
  }

  const alreadyPaid = String(order.status).toLowerCase() === "paid";

  if (!alreadyPaid) {
    const customerEmail =
      (session.customer_details?.email || "").trim() || (order.customer_email || "").trim() || null;

    await sb
      .from("orders")
      .update({
        status: "paid",
        stripe_session_id: sessionId,
        customer_email: customerEmail,
      })
      .eq("id", orderId);
  }

  // 4) 发邮件（mailer 内部幂等）
  const email = await sendPaidEmail({
    orderId,
    bookingId: (order as any).booking_id ?? null,
    amountCents: (order as any).amount_cents ?? null,
    currency: (order as any).currency ?? null,
    customerEmail:
      (session.customer_details?.email || "").trim() || (order.customer_email || "").trim() || null,
  });

  return NextResponse.json(
    {
      ok: true,
      status: "paid",
      emailed: !(email as any)?.skipped,
      emailResult: email,
    },
    { status: 200 }
  );
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    // 兼容多种 query 名称：orderId / orderid
    const orderId =
      url.searchParams.get("orderId") ||
      url.searchParams.get("orderid") ||
      url.searchParams.get("order_id") ||
      "";

    // 关键：兼容 session_id（你页面就是这个）以及 sessionId
    const sessionId =
      url.searchParams.get("sessionId") ||
      url.searchParams.get("session_id") ||
      url.searchParams.get("sessionid") ||
      "";

    return await confirmPaid({ orderId, sessionId });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: "server_error", detail: String(e?.message ?? e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as any;
    return await confirmPaid({
      orderId: body?.orderId || body?.order_id || "",
      sessionId: body?.sessionId || body?.session_id || "",
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: "server_error", detail: String(e?.message ?? e) }, { status: 500 });
  }
}