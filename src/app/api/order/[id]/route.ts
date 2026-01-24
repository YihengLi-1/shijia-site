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

    return NextResponse.json({ ok: true, order: data });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: "server_error", detail: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}