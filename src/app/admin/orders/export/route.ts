import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function supabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key, { auth: { persistSession: false } });
}

function csvCell(v: unknown) {
  const s = String(v ?? "");
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET(req: Request) {
  const supabase = supabaseAdmin();
  const url = new URL(req.url);
  const qRaw = (url.searchParams.get("q") || "").slice(0, 60);
  const q = qRaw.replace(/[%_,]/g, " ").trim();
  const status = (url.searchParams.get("status") || "all").toLowerCase();
  const from = (url.searchParams.get("from") || "").trim();
  const to = (url.searchParams.get("to") || "").trim();

  let ordersQuery = supabase
    .from("orders")
    .select("id,created_at,name,phone,visit_date,visit_time,party_size,amount_cents,currency,status,booking_id")
    .order("created_at", { ascending: false })
    .limit(1000);

  if (status && status !== "all") {
    ordersQuery = ordersQuery.eq("status", status);
  }
  if (from) {
    ordersQuery = ordersQuery.gte("created_at", `${from}T00:00:00.000Z`);
  }
  if (to) {
    ordersQuery = ordersQuery.lte("created_at", `${to}T23:59:59.999Z`);
  }
  if (q) {
    if (/^[0-9a-f-]{16,}$/i.test(q)) {
      ordersQuery = ordersQuery.or(`name.ilike.%${q}%,phone.ilike.%${q}%,id.eq.${q}`);
    } else {
      ordersQuery = ordersQuery.or(`name.ilike.%${q}%,phone.ilike.%${q}%`);
    }
  }

  const { data: orders, error } = await ordersQuery;
  if (error) {
    return NextResponse.json(
      { ok: false, error: "orders_fetch_failed", detail: error.message },
      { status: 500 }
    );
  }

  const orderRows = orders ?? [];
  const orderIds = orderRows.map((o: any) => String(o.id)).filter(Boolean);

  let itemsMap = new Map<string, Array<{ item_name: string | null; qty: number | null; unit_price_cents: number | null }>>();
  if (orderIds.length > 0) {
    const { data: oi } = await supabase
      .from("order_items")
      .select("order_id,item_name,qty,unit_price_cents")
      .in("order_id", orderIds);

    const list = oi ?? [];
    itemsMap = list.reduce((acc: Map<string, Array<{ item_name: string | null; qty: number | null; unit_price_cents: number | null }>>, row: any) => {
      const k = String(row.order_id ?? "");
      if (!k) return acc;
      const prev = acc.get(k) ?? [];
      prev.push(row);
      acc.set(k, prev);
      return acc;
    }, new Map());
  }

  const header = [
    "created_at",
    "order_id",
    "status",
    "name",
    "phone",
    "visit_date",
    "visit_time",
    "party_size",
    "amount_cents",
    "currency",
    "items",
    "items_amount_cents",
    "reconciled",
    "booking_id",
  ];

  const lines = [header.map(csvCell).join(",")];

  for (const row of orderRows as any[]) {
    const oi = itemsMap.get(String(row.id)) ?? [];
    const itemsText = oi
      .map((x) => `${String(x.item_name ?? "").trim() || "未命名"} x ${Number(x.qty ?? 0)}`)
      .join(" | ");
    const itemsAmount = oi.reduce((sum, x) => {
      const qty = Number(x.qty ?? 0);
      const up = Number(x.unit_price_cents ?? 0);
      return sum + (Number.isFinite(qty) && Number.isFinite(up) ? qty * up : 0);
    }, 0);
    const orderAmount = Number(row.amount_cents ?? 0);
    const reconciled = oi.length > 0 ? String(orderAmount === itemsAmount) : "";

    const line = [
      row.created_at ?? "",
      row.id ?? "",
      row.status ?? "",
      row.name ?? "",
      row.phone ?? "",
      row.visit_date ?? "",
      row.visit_time ?? "",
      row.party_size ?? "",
      row.amount_cents ?? "",
      row.currency ?? "",
      itemsText,
      itemsAmount,
      reconciled,
      row.booking_id ?? "",
    ];
    lines.push(line.map(csvCell).join(","));
  }

  const csv = lines.join("\n");
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="orders-export-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
