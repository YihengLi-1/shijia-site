import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { checkRateLimit, clientIpFromHeaders } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover" as any,
});

export async function POST(req: Request) {
  try {
    const ip = clientIpFromHeaders(req.headers);
    const limit = checkRateLimit(`donation:checkout:${ip}`, {
      windowMs: 10 * 60 * 1000,
      max: 20,
    });
    if (!limit.ok) {
      return NextResponse.json(
        { ok: false, error: "rate_limited", retryAfterSec: limit.retryAfterSec },
        { status: 429 }
      );
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ ok: false, error: "missing_STRIPE_SECRET_KEY" }, { status: 500 });
    }
    if (!process.env.NEXT_PUBLIC_SITE_URL) {
      return NextResponse.json({ ok: false, error: "missing_NEXT_PUBLIC_SITE_URL" }, { status: 500 });
    }

    const body = await req.json().catch(() => ({}));
    const donationId = body?.donationId;

    if (!donationId) {
      return NextResponse.json({ ok: false, error: "missing_donationId" }, { status: 400 });
    }

    // ✅ 关键：先拿到 client
    const sb = supabaseAdmin();

    const { data: donation, error: fetchErr } = await sb
      .from("donations")
      .select("id,amount_cents,currency,status,email,name,stripe_session_id")
      .eq("id", donationId)
      .maybeSingle();

    if (fetchErr || !donation) {
      return NextResponse.json(
        { ok: false, error: "donation_not_found", detail: fetchErr?.message },
        { status: 404 }
      );
    }

    if (donation.status === "paid" && donation.stripe_session_id) {
      // 已支付就直接返回（避免重复下单）
      return NextResponse.json({
        ok: true,
        donationId: donation.id,
        reused: true,
        sessionId: donation.stripe_session_id,
      });
    }

    if (donation.status && donation.status !== "pending") {
      return NextResponse.json(
        { ok: false, error: "donation_not_payable", detail: donation.status },
        { status: 400 }
      );
    }

    if (donation.stripe_session_id) {
      try {
        const existing = await stripe.checkout.sessions.retrieve(donation.stripe_session_id);
        if (existing.url) {
          return NextResponse.json({
            ok: true,
            donationId: donation.id,
            reused: true,
            sessionId: existing.id,
            url: existing.url,
          });
        }
      } catch {
        // 旧 session 不可用则继续创建
      }
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
    const successUrl = `${siteUrl}/donation/success?donationId=${donation.id}&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${siteUrl}/donation?canceled=1`;

    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        customer_email: donation.email ?? undefined,
        line_items: [
          {
            price_data: {
              currency: donation.currency,
              unit_amount: donation.amount_cents,
              product_data: { name: "随喜捐款 Donation" },
            },
            quantity: 1,
          },
        ],
        metadata: { donationId: donation.id },
        success_url: successUrl,
        cancel_url: cancelUrl,
      },
      {
        idempotencyKey: `donation_checkout_${donation.id}`,
      }
    );

    const { error: updErr } = await sb
      .from("donations")
      .update({ stripe_session_id: session.id })
      .eq("id", donation.id);

    if (updErr) {
      return NextResponse.json(
        { ok: false, error: "db_update_failed", detail: updErr.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      donationId: donation.id,
      sessionId: session.id,
      url: session.url,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: "server_error", detail: e?.message || "unknown" },
      { status: 500 }
    );
  }
}
