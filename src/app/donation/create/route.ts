import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const amountCents = Number(body.amountCents);
    const currency = String(body.currency || "usd").toLowerCase();
    const email = String(body.email || "").trim();
    const name = String(body.name || "").trim();

    if (!Number.isFinite(amountCents) || amountCents <= 0) {
      return NextResponse.json({ ok: false, error: "amount_invalid" }, { status: 400 });
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