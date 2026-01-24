// src/app/api/order/[id]/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const orderId = String(id || "").trim();
    if (!orderId) return NextResponse.json({ ok: false, error: "missing_orderId" }, { status: 400 });

    const sb = supabaseAdmin();

    // 只返回前端需要的“安全字段”
    const { data: order, error } = await sb
      .from("orders")
      .select("id, status, booking_id, amount_cents, currency, paid_at, stripe_session_id")
      .eq("id", orderId)
      .single();

    if (error || !order) {
      return NextResponse.json({ ok: false, error: "order_not_found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, order }, { status: 200 });
  } catch (e: any) {
    console.error("ORDER_GET_ERROR", e);
    return NextResponse.json(
      { ok: false, error: "server_error", detail: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}