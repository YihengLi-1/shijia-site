import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { checkRateLimit, clientIpFromHeaders } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIN_DONATION_CENTS = 500;    // $5
const MAX_DONATION_CENTS = 999900; // $9,999 — configurable via DONATION_MAX_CENTS env var
const ALLOWED_CURRENCIES = new Set(["usd"]);

export async function POST(req: Request) {
  try {
    const ip = clientIpFromHeaders(req.headers);
    const limit = checkRateLimit(`donation:create:${ip}`, {
      windowMs: 10 * 60 * 1000,
      max: 20,
    });
    if (!limit.ok) {
      return NextResponse.json(
        { ok: false, error: "rate_limited", retryAfterSec: limit.retryAfterSec },
        { status: 429 }
      );
    }

    const body = await req.json();
    const amountCents = Math.trunc(Number(body.amountCents));
    // Allow override via env (e.g. DONATION_MAX_CENTS=200000 for $2,000 cap)
    const effectiveMax = Math.trunc(Number(process.env.DONATION_MAX_CENTS || MAX_DONATION_CENTS));
    const currency = String(body.currency || "usd").toLowerCase().trim();
    const email = String(body.email || "").trim();
    const name = String(body.name || "").trim();

    if (
      !Number.isFinite(amountCents) ||
      amountCents < MIN_DONATION_CENTS ||
      amountCents > effectiveMax
    ) {
      return NextResponse.json({ ok: false, error: "amount_invalid" }, { status: 400 });
    }
    if (!ALLOWED_CURRENCIES.has(currency)) {
      return NextResponse.json({ ok: false, error: "currency_invalid" }, { status: 400 });
    }
    if (!email) {
      return NextResponse.json({ ok: false, error: "missing_email" }, { status: 400 });
    }

    const sb = supabaseAdmin();

    const { data, error } = await sb
      .from("donations")
      .insert({
        amount_cents: amountCents,
        currency,
        status: "pending",
        email,
        name: name || null,
      })
      .select("id,amount_cents,currency,status,email,name")
      .single();

    if (error || !data) {
      return NextResponse.json(
        { ok: false, error: "db_insert_failed", detail: error?.message || "unknown" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      donationId: data.id,
      amountCents: data.amount_cents,
      currency: data.currency,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: "server_error", detail: e?.message || "unknown" },
      { status: 500 }
    );
  }
}
