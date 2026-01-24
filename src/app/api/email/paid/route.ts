// src/app/api/email/paid/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendPaidEmail } from "@/lib/mailer";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { orderId } = (await req.json().catch(() => ({}))) as { orderId?: string };
    if (!orderId) return NextResponse.json({ ok: false, error: "missing_orderId" }, { status: 400 });

    const sb = supabaseAdmin();
    const { data: order, error } = await sb
      .from("orders")
      .select("id, status, booking_id, amount_cents, currency, customer_email")
      .eq("id", orderId)
      .single();

    if (error || !order) {
      return NextResponse.json({ ok: false, error: "order_not_found", detail: error?.message }, { status: 404 });
    }

    if (String((order as any).status) !== "paid") {
      return NextResponse.json({ ok: true, skipped: true, reason: "not_paid" }, { status: 200 });
    }

    const result = await sendPaidEmail({
      orderId: String((order as any).id),
      bookingId: (order as any).booking_id,
      amountCents: (order as any).amount_cents,
      currency: (order as any).currency,
      customerEmail: (order as any).customer_email,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message ?? e) }, { status: 500 });
  }
}