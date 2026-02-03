// src/app/api/book/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type CartItem = {
  menuItemId: string;
  name: string;
  unitPriceCents: number;
  qty: number;
};

type Payload = {
  name: string;
  phone: string;
  email?: string;
  people: number | string;
  date: string;
  time: string;
  note?: string;

  // ✅ 购物车明细（必须传）
  items: CartItem[];

  // 可选：默认 usd
  currency?: string;
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toISODate(input: string) {
  const v = String(input || "").trim();
  if (!v) throw new Error("date_required");

  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;

  const m = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) {
    const mm = pad2(Number(m[1]));
    const dd = pad2(Number(m[2]));
    const yyyy = m[3];
    return `${yyyy}-${mm}-${dd}`;
  }

  return v;
}

function toTimeHHMMSS(input: string) {
  const v = String(input || "").trim();
  if (!v) throw new Error("time_required");

  const m24 = v.match(/^(\d{1,2}):(\d{2})$/);
  if (m24) {
    const hh = Number(m24[1]);
    const mm = Number(m24[2]);
    if (hh < 0 || hh > 23 || mm < 0 || mm > 59) throw new Error("invalid_time");
    return `${pad2(hh)}:${pad2(mm)}:00`;
  }

  const m12 = v.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (m12) {
    let hh = Number(m12[1]);
    const mm = Number(m12[2]);
    const ap = m12[3].toUpperCase();
    if (hh < 1 || hh > 12 || mm < 0 || mm > 59) throw new Error("invalid_time");
    if (ap === "AM") {
      if (hh === 12) hh = 0;
    } else {
      if (hh !== 12) hh += 12;
    }
    return `${pad2(hh)}:${pad2(mm)}:00`;
  }

  return v;
}

function validateItems(items: any): CartItem[] {
  if (!Array.isArray(items) || items.length === 0) throw new Error("items_required");

  const cleaned: CartItem[] = [];
  for (const raw of items) {
    const menuItemId = String(raw?.menuItemId ?? "").trim();
    const name = String(raw?.name ?? "").trim();
    const unitPriceCents = Number(raw?.unitPriceCents);
    const qty = Number(raw?.qty);

    if (!menuItemId) throw new Error("item_menuItemId_required");
    if (!name) throw new Error("item_name_required");
    if (!Number.isFinite(unitPriceCents) || unitPriceCents < 0) throw new Error("item_unitPrice_invalid");
    if (!Number.isFinite(qty) || qty < 1 || qty > 99) throw new Error("item_qty_invalid");

    cleaned.push({ menuItemId, name, unitPriceCents, qty });
  }
  return cleaned;
}

function calcAmountCents(items: CartItem[]) {
  return items.reduce((sum, it) => sum + it.unitPriceCents * it.qty, 0);
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Payload;

    const name = String(body?.name ?? "").trim();
    const phone = String(body?.phone ?? "").trim();
    const peopleNum = Number(body?.people ?? 0);
    const dateVal = toISODate(String(body?.date ?? ""));
    const timeVal = toTimeHHMMSS(String(body?.time ?? ""));
    const currency = String(body?.currency ?? "usd").toLowerCase().trim() || "usd";

    if (!name) return NextResponse.json({ detail: "name_required" }, { status: 400 });
    if (!phone) return NextResponse.json({ detail: "phone_required" }, { status: 400 });
    if (!Number.isFinite(peopleNum) || peopleNum < 1 || peopleNum > 50) {
      return NextResponse.json({ detail: "people_invalid" }, { status: 400 });
    }

    let items: CartItem[];
    try {
      items = validateItems((body as any)?.items);
    } catch (e: any) {
      return NextResponse.json({ detail: String(e?.message || e || "items_invalid") }, { status: 400 });
    }

    const url = (process.env.SUPABASE_URL ?? "").trim();
    const key = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim();
    if (!url || !key) return NextResponse.json({ detail: "missing_supabase_env" }, { status: 500 });

    const supabase = createClient(url, key, { auth: { persistSession: false } });

    // 1) create booking
    const { data: booking, error: bookErr } = await supabase
      .from("bookings")
      .insert({
        name,
        phone,
        people: peopleNum,
        date: dateVal,
        time: timeVal,
      })
      .select("id")
      .single();

    if (bookErr || !booking) {
      return NextResponse.json(
        { error: "booking_insert_failed", detail: bookErr?.message ?? "unknown" },
        { status: 500 }
      );
    }

    const amountCents = calcAmountCents(items);

    // 2) create order
    // ✅ 对齐你现在真实约束：type NOT NULL、amount_cents NOT NULL
    // status: pending（后续 /api/pay/confirm 或 webhook 改为 paid）
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        booking_id: booking.id,
        status: "pending",
        currency,
        amount_cents: amountCents,
        type: "menu", // ✅ 关键：避免 type NOT NULL 报错
      })
      .select("id")
      .single();

    if (orderErr || !order) {
      return NextResponse.json(
        { error: "order_insert_failed", detail: orderErr?.message ?? "unknown" },
        { status: 500 }
      );
    }

    // 3) create order_items
    // ✅ 不写 line_total_cents（generated/不可写/或不存在）
    const rows = items.map((it) => ({
      order_id: order.id,
      menu_item_id: it.menuItemId,
      item_name: it.name,
      unit_price_cents: it.unitPriceCents,
      qty: it.qty,
    }));

    const { error: oiErr } = await supabase.from("order_items").insert(rows);

    if (oiErr) {
      return NextResponse.json(
        { error: "order_items_insert_failed", detail: oiErr.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        bookingId: booking.id,
        orderId: order.id,
        amountCents,
        currency,
      },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { error: "server_error", detail: String(e?.message || e || "unknown") },
      { status: 500 }
    );
  }
}