// src/app/api/checkout/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { checkRateLimit, clientIpFromHeaders } from "@/lib/rateLimit";

export const runtime = "nodejs";

function json(status: number, body: any) {
  return NextResponse.json(body, { status });
}

function bad(msg: string, detail?: any, status = 400) {
  return json(status, { ok: false, error: msg, detail });
}

function mustEnv(name: string) {
  const v = (process.env[name] ?? "").toString().trim();
  if (!v) throw new Error(`missing ${name}`);
  return v;
}

function supabaseAdmin() {
  const url = mustEnv("SUPABASE_URL");
  const key = mustEnv("SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(req: Request) {
  try {
    const ip = clientIpFromHeaders(req.headers);
    const limit = checkRateLimit(`order:checkout:${ip}`, {
      windowMs: 10 * 60 * 1000,
      max: 20,
    });
    if (!limit.ok) return bad("rate_limited", { retryAfterSec: limit.retryAfterSec }, 429);

    const body = (await req.json().catch(() => ({}))) as { orderId?: string };
    const orderId = String(body?.orderId ?? "").trim();
    if (!orderId) return bad("missing_orderId");

    const siteUrl = mustEnv("NEXT_PUBLIC_SITE_URL");
    const stripeKey = mustEnv("STRIPE_SECRET_KEY");

    const supabase = supabaseAdmin();

    // 1) 读订单
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("id, amount_cents, currency, status, email, customer_email")
      .eq("id", orderId)
      .single();

    if (orderErr || !order) return bad("order_not_found", orderErr?.message, 404);

    // 只允许 pending 去结算（你如果有别的状态，自己在这里扩展）
    if (String(order.status).toLowerCase() !== "pending") {
      return bad("order_not_payable", { status: order.status }, 400);
    }

    const amount = Number(order.amount_cents ?? 0);
    if (!Number.isFinite(amount) || amount <= 0) return bad("invalid_amount_cents", amount, 400);

    const currency = String(order.currency ?? "usd").toLowerCase();

    // 2) Stripe Client（用你现在 types 认可的 apiVersion）
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2025-12-15.clover",
    });

    if (String(order.status).toLowerCase() === "paid") {
      return bad("order_already_paid", { status: order.status }, 400);
    }

    if ((order as any).stripe_session_id) {
      try {
        const existing = await stripe.checkout.sessions.retrieve(
          String((order as any).stripe_session_id)
        );
        if (existing?.url) {
          return json(200, {
            ok: true,
            orderId: order.id,
            sessionId: existing.id,
            url: existing.url,
            reused: true,
          });
        }
      } catch {
        // fall through to create a new session
      }
    }

    // 3) 创建 Checkout Session（关键：orderId 写进 metadata + client_reference_id）
    const customerEmail =
      String((order as any).customer_email || "").trim() ||
      String((order as any).email || "").trim() ||
      undefined;

    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        client_reference_id: order.id,
        metadata: { orderId: order.id },
        customer_email: customerEmail,

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

        success_url: `${siteUrl}/pay/success?orderId=${encodeURIComponent(order.id)}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${siteUrl}/pay?orderId=${encodeURIComponent(order.id)}`,
      },
      {
        // 同一个订单重复请求，不要生成多个 session
        idempotencyKey: `checkout_${order.id}`,
      }
    );

    // 4) 写回 session.id（db 里留证）
    await supabase
      .from("orders")
      .update({ stripe_session_id: session.id })
      .eq("id", order.id);

    console.log(
      JSON.stringify({
        level: "info",
        msg: "checkout_created",
        orderId: order.id,
        sessionId: session.id,
        amount: amount,
        currency,
      })
    );

    return json(200, {
      ok: true,
      orderId: order.id,
      sessionId: session.id,
      url: session.url ?? null,
    });
  } catch (e: any) {
    return json(500, { ok: false, error: "server_error", detail: String(e?.message ?? e) });
  }
}
