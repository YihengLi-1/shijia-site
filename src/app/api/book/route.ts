// src/app/api/book/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CartItem = {
  menuItemId: string;
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

  items: CartItem[];
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
    const qty = Number(raw?.qty);

    if (!menuItemId) throw new Error("item_menuItemId_required");
    if (!Number.isFinite(qty) || qty < 1 || qty > 99) throw new Error("item_qty_invalid");

    cleaned.push({ menuItemId, qty });
  }
  return cleaned;
}

type PricedItem = {
  menuItemId: string;
  name: string;
  unitPriceCents: number;
  qty: number;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Payload;

    const name = String(body?.name ?? "").trim();
    const phone = String(body?.phone ?? "").trim();
    const email = String(body?.email ?? "").trim() || null;
    const note = String(body?.note ?? "").trim() || null;

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
      return NextResponse.json(
        { detail: String(e?.message || e || "items_invalid") },
        { status: 400 }
      );
    }

    const url = (process.env.SUPABASE_URL ?? "").trim();
    const key = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim();
    if (!url || !key) return NextResponse.json({ detail: "missing_supabase_env" }, { status: 500 });

    const supabase = createClient(url, key, { auth: { persistSession: false } });

    // ✅ 价格可信：从数据库取价格和名称，忽略前端传入的价格/名称
    const ids = Array.from(new Set(items.map((it) => it.menuItemId)));
    const { data: menuRows, error: menuErr } = await supabase
      .from("menu_items")
      .select("id,name,price_cents,is_available")
      .in("id", ids);

    if (menuErr) {
      return NextResponse.json(
        { error: "menu_fetch_failed", detail: menuErr.message },
        { status: 500 }
      );
    }

    const priceMap = new Map<string, { name: string; price: number; available: boolean }>();
    for (const r of menuRows ?? []) {
      priceMap.set(String((r as any).id), {
        name: String((r as any).name ?? ""),
        price: Number((r as any).price_cents ?? 0),
        available: Boolean((r as any).is_available),
      });
    }

    const pricedItems: PricedItem[] = [];
    let amountCents = 0;
    for (const it of items) {
      const meta = priceMap.get(it.menuItemId);
      if (!meta) {
        return NextResponse.json({ detail: "item_not_found" }, { status: 400 });
      }
      if (!meta.available) {
        return NextResponse.json({ detail: "item_unavailable" }, { status: 400 });
      }
      if (!Number.isFinite(meta.price) || meta.price <= 0) {
        return NextResponse.json({ detail: "item_price_invalid" }, { status: 400 });
      }
      pricedItems.push({
        menuItemId: it.menuItemId,
        name: meta.name,
        unitPriceCents: meta.price,
        qty: it.qty,
      });
      amountCents += meta.price * it.qty;
    }

    if (!Number.isFinite(amountCents) || amountCents <= 0) {
      return NextResponse.json({ detail: "amount_invalid" }, { status: 400 });
    }

    // 1) create booking
    const { data: booking, error: bookErr } = await supabase
      .from("bookings")
      .insert({
        name,
        phone,
        people: peopleNum,
        date: dateVal,
        time: timeVal,
        email, // ✅ 你表里有 email
        note,  // ✅ 你表里有 note
      })
      .select("id")
      .single();

    if (bookErr || !booking) {
      return NextResponse.json(
        { error: "booking_insert_failed", detail: bookErr?.message ?? "unknown" },
        { status: 500 }
      );
    }

    // 2) create order  ✅ type 只能 booking/donation
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        booking_id: booking.id,
        type: "booking",        // ✅ 修正：别用 "menu"
        status: "pending",
        currency,
        amount_cents: amountCents,
        name,
        phone,
        email,
        visit_date: dateVal,
        visit_time: timeVal,
        party_size: peopleNum,
      })
      .select("id")
      .single();

    if (orderErr || !order) {
      // 回滚 booking，避免脏数据
      await supabase.from("bookings").delete().eq("id", booking.id);
      return NextResponse.json(
        { error: "order_insert_failed", detail: orderErr?.message ?? "unknown" },
        { status: 500 }
      );
    }

    console.log(
      JSON.stringify({
        level: "info",
        msg: "order_created",
        orderId: order.id,
        bookingId: booking.id,
        amountCents,
        currency,
      })
    );

    // 3) create order_items（不要写 line_total_cents）
    const rows = pricedItems.map((it) => ({
      order_id: order.id,
      menu_item_id: it.menuItemId,
      item_name: it.name,
      unit_price_cents: it.unitPriceCents,
      qty: it.qty,
    }));

    const { error: oiErr } = await supabase.from("order_items").insert(rows);
    if (oiErr) {
      // 回滚 order + booking
      await supabase.from("orders").delete().eq("id", order.id);
      await supabase.from("bookings").delete().eq("id", booking.id);

      return NextResponse.json(
        { error: "order_items_insert_failed", detail: oiErr.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { ok: true, bookingId: booking.id, orderId: order.id, amountCents, currency },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { error: "server_error", detail: String(e?.message || e || "unknown") },
      { status: 500 }
    );
  }
}
