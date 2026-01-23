// src/app/api/checkout/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function bad(msg: string, detail?: any, status = 400) {
  return NextResponse.json({ error: msg, detail }, { status });
}

function supabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as { orderId?: string } | null;
    const orderId = String(body?.orderId ?? "").trim();
    if (!orderId) return bad("missing_orderId");

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!siteUrl) return bad("missing_env", "NEXT_PUBLIC_SITE_URL", 500);
    if (!stripeKey) return bad("missing_env", "STRIPE_SECRET_KEY", 500);

    const supabase = supabaseAdmin();
    const stripe = new Stripe(stripeKey);

    // 1) 读订单
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("id, amount_cents, currency, status")
      .eq("id", orderId)
      .single();

    if (orderErr || !order) return bad("order_not_found", orderErr?.message, 404);

    // 只允许 pending 去结算
    if (String(order.status).toLowerCase() !== "pending") {
      return bad("order_not_payable", { status: order.status }, 400);
    }

    const amount = Number(order.amount_cents ?? 0);
    if (!Number.isFinite(amount) || amount <= 0) return bad("invalid_amount_cents", amount, 400);

    const currency = String(order.currency ?? "usd");

    // 2) 创建 Stripe Checkout Session（最关键：把 orderId 写进 metadata + client_reference_id）
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      client_reference_id: order.id,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency,
            unit_amount: amount,
            product_data: { name: `Order ${order.id}` },
          },
        },
      ],
      metadata: { orderId: order.id },
      success_url: `${siteUrl}/pay/success?orderId=${encodeURIComponent(order.id)}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/pay?orderId=${encodeURIComponent(order.id)}`,
    });

    // 3) 把 session.id 写回 orders（确保 DB 里永远有“真实 session id”）
    await supabase
      .from("orders")
      .update({ stripe_session_id: session.id })
      .eq("id", order.id);

    // 4) 返回 url + sessionId（前端可以用来调试/显示）
    return NextResponse.json(
      { ok: true, url: session.url, sessionId: session.id, orderId: order.id },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { error: "server_error", detail: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}