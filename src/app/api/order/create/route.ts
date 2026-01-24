// src/app/api/order/create/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function bad(msg: string, detail?: any, status = 400) {
  return NextResponse.json({ ok: false, error: msg, detail }, { status });
}

function must(name: string) {
  const v = (process.env[name] || "").trim();
  if (!v) throw new Error(`missing ${name}`);
  return v;
}

function supabaseAdmin() {
  const url = must("SUPABASE_URL");
  const key = must("SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key, { auth: { persistSession: false } });
}

/**
 * 创建一个“可支付订单”
 * - type: 固定 booking（你表里就是这个）
 * - status: 固定 pending（checkout 只允许 pending）
 * - amount_cents/currency 必填（checkout 要用）
 * - 其它字段可选（name/phone/visit_date 等你后面再补）
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      amountCents?: number;
      currency?: string;
      name?: string;
      phone?: string;
      visitDate?: string; // "YYYY-MM-DD"
    };

    const amountCents = Number(body.amountCents ?? 0);
    if (!Number.isFinite(amountCents) || amountCents <= 0) {
      return bad("invalid_amountCents", amountCents, 400);
    }

    const currency = String(body.currency ?? "usd").trim().toLowerCase();
    if (!currency) return bad("invalid_currency");

    const sb = supabaseAdmin();

    const payload: any = {
      type: "booking",
      status: "pending",
      amount_cents: amountCents,
      currency,
    };

    // 可选字段（你表里有的话就写，没有也不影响）
    if (body.name) payload.name = String(body.name);
    if (body.phone) payload.phone = String(body.phone);
    if (body.visitDate) payload.visit_date = String(body.visitDate);

    const { data, error } = await sb.from("orders").insert(payload).select("id").single();

    if (error || !data) {
      return bad("insert_failed", error?.message ?? String(error), 500);
    }

    return NextResponse.json({ ok: true, orderId: data.id }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: "server_error", detail: String(e?.message ?? e) }, { status: 500 });
  }
}