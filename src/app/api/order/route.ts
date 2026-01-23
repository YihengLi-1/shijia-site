import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

type ItemInput = { menuItemId: string; qty: number };

type Body = {
  bookingId?: string;
  items?: ItemInput[];

  // 兼容：如果前端也传了这些也能用
  name?: string;
  phone?: string;
  email?: string;
  visitDate?: string;
  visitTime?: string;
  partySize?: number;
};

function bad(msg: string, detail?: any, status = 400) {
  return NextResponse.json({ error: msg, detail }, { status });
}

function supabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key, { auth: { persistSession: false } });
}

function pickFirst<T>(...vals: Array<T | null | undefined>): T | undefined {
  for (const v of vals) {
    if (v !== undefined && v !== null && String(v).trim() !== "") return v;
  }
  return undefined;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as Body | null;
    if (!body) return bad("invalid_json");

    const supabase = supabaseAdmin();

    // ===== 1) 凑齐订单所需信息（允许只传 bookingId）=====
    let bookingId = body.bookingId ? String(body.bookingId) : "";

    let name = body.name?.trim();
    let phone = body.phone?.trim();
    let email = body.email?.trim();
    let visitDate = body.visitDate?.trim();
    let visitTime = body.visitTime?.trim();
    let partySize = body.partySize;

    // ✅ 只给 bookingId：从 bookings 表补齐（包含 email）
    if (bookingId && (!name || !phone || !email || !visitDate || !partySize || !visitTime)) {
      const { data: booking, error: bkErr } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", bookingId)
        .single();

      if (bkErr || !booking) return bad("booking_not_found", bkErr?.message, 404);

      name = pickFirst(name, (booking as any).name);
      phone = pickFirst(phone, (booking as any).phone);
      email = pickFirst(email, (booking as any).email);

      visitDate = pickFirst(visitDate, (booking as any).date, (booking as any).visit_date);
      visitTime = pickFirst(visitTime, (booking as any).time, (booking as any).visit_time, "12:00");

      const ps = pickFirst<any>(partySize as any, (booking as any).people, (booking as any).party_size);
      partySize = ps ? Number(ps) : undefined;
    }

    if (!bookingId) return bad("missing_bookingId");
    if (!name) return bad("missing_name");
    if (!phone) return bad("missing_phone");
    if (!email) return bad("missing_email"); // ✅ 关键：要发给真实用户必须有 email
    if (!visitDate) return bad("missing_visitDate");
    if (!visitTime) return bad("missing_visitTime");
    if (!partySize || !Number.isFinite(Number(partySize)) || Number(partySize) <= 0) return bad("invalid_partySize");

    // ===== 2) 金额计算（没 items 就固定 $10 用于闭环测试）=====
    const items = Array.isArray(body.items) ? body.items : [];
    let amountCents = 1000; // 默认 $10
    let itemRowsToInsert:
      | Array<{
          order_id: string;
          menu_item_id: string;
          item_name: string;
          qty: number;
          unit_price_cents: number;
        }>
      | null = null;

    if (items.length > 0) {
      const ids = Array.from(new Set(items.map((it) => String(it.menuItemId)).filter(Boolean)));
      if (ids.length === 0) return bad("invalid_menuItemId_list");

      const { data: menuRows, error: menuErr } = await supabase
        .from("menu_items")
        .select("id, name, price_cents")
        .in("id", ids);

      if (menuErr) return bad("menu_query_failed", menuErr.message, 500);

      const priceMap = new Map<string, number>();
      const nameMap = new Map<string, string>();
      for (const r of menuRows ?? []) {
        const id = String((r as any).id);
        priceMap.set(id, Number((r as any).price_cents ?? 0));
        nameMap.set(id, String((r as any).name ?? ""));
      }

      amountCents = 0;
      itemRowsToInsert = [];

      for (const it of items) {
        const menu_item_id = String(it.menuItemId || "");
        const qty = Number(it.qty);

        if (!menu_item_id) return bad("invalid_menuItemId");
        if (!Number.isFinite(qty) || qty <= 0) return bad("invalid_qty", it);

        const p = priceMap.get(menu_item_id);
        const n = nameMap.get(menu_item_id);
        if (!p || p <= 0) return bad("menu_price_missing", { menuItemId: menu_item_id });
        if (!n) return bad("menu_name_missing", { menuItemId: menu_item_id });

        amountCents += p * qty;

        itemRowsToInsert.push({
          order_id: "PLACEHOLDER",
          menu_item_id,
          item_name: n,
          qty,
          unit_price_cents: p,
        });
      }
    }

    // ===== 3) 幂等：同 bookingId 只允许 1 条 pending =====
    const { data: existingPending, error: existingErr } = await supabase
      .from("orders")
      .select("id")
      .eq("booking_id", bookingId)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!existingErr && existingPending?.id) {
      return NextResponse.json(
        { ok: true, orderId: String(existingPending.id), amountCents, currency: "usd", reused: true },
        { status: 200 }
      );
    }

    // ===== 4) 创建订单（把 email 写进 orders，后续 webhook 才能发给真实用户）=====
    const { data: orderRow, error: orderErr } = await supabase
      .from("orders")
      .insert({
        type: "booking",
        status: "pending",
        booking_id: bookingId,
        name,
        phone,
        email, // ✅ 关键
        visit_date: visitDate,
        visit_time: visitTime,
        party_size: Number(partySize),
        amount_cents: amountCents,
        currency: "usd",
      })
      .select("id")
      .single();

    if (orderErr || !orderRow?.id) {
      return bad("order_insert_failed", (orderErr as any)?.message ?? orderErr, 500);
    }

    const orderId = String((orderRow as any).id);

    // ===== 5) 有 items 就写 order_items =====
    if (itemRowsToInsert && itemRowsToInsert.length > 0) {
      const realRows = itemRowsToInsert.map((r) => ({ ...r, order_id: orderId }));
      const { error: itemErr } = await supabase.from("order_items").insert(realRows);

      if (itemErr) {
        await supabase.from("orders").delete().eq("id", orderId);
        return bad("order_items_insert_failed", itemErr.message, 500);
      }
    }

    return NextResponse.json(
      { ok: true, orderId, amountCents, currency: "usd", reused: false },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: "server_error", detail: String(e?.message ?? e) }, { status: 500 });
  }
}