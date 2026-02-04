// src/app/api/order/[id]/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> } // ✅ Next 15 / Turbopack 兼容写法
) {
  try {
    const { id } = await ctx.params;
    const orderId = (id || "").trim();

    if (!orderId) {
      return NextResponse.json({ ok: false, error: "missing_orderId" }, { status: 400 });
    }

    const sb = supabaseAdmin(); // ✅ 必须是 service role

    const { data, error } = await sb
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { ok: false, error: "db_error", detail: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { ok: false, error: "order_not_found", orderId },
        { status: 404 }
      );
    }

    const itemsRes = await sb
      .from("order_items")
      .select("menu_item_id, item_name, unit_price_cents, qty")
      .eq("order_id", orderId)
      .order("item_name", { ascending: true });

    let booking = null;
    if ((data as any)?.booking_id) {
      const bk = await sb
        .from("bookings")
        .select("id, name, phone, email, date, time, people, note")
        .eq("id", (data as any).booking_id)
        .maybeSingle();
      booking = bk?.data ?? null;
    }

    const items = (itemsRes?.data ?? []).map((it: any) => ({
      ...it,
      line_total_cents: Number(it.unit_price_cents ?? 0) * Number(it.qty ?? 0),
    }));
    const computedTotalCents = items.reduce(
      (sum: number, it: any) => sum + Number(it.line_total_cents ?? 0),
      0
    );

    return NextResponse.json({
      ok: true,
      status: (data as any)?.status ?? null,
      order: data,
      items,
      computedTotalCents,
      booking,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: "server_error", detail: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}
