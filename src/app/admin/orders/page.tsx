import Header from "@/components/Header";
import Container from "@/components/Container";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SearchValue = string | string[] | undefined;

function supabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key, { auth: { persistSession: false } });
}

function one(v: SearchValue) {
  if (Array.isArray(v)) return String(v[0] ?? "").trim();
  return String(v ?? "").trim();
}

function buildSearchParams(input: Record<string, string>) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(input)) {
    if (v) p.set(k, v);
  }
  return p.toString();
}

function StatusPill({ status }: { status: string | null | undefined }) {
  const s = String(status ?? "").toLowerCase();
  const cls =
    s === "paid"
      ? "bg-green-100 text-green-800 ring-green-200"
      : s === "pending" || s === "pending_payment"
      ? "bg-yellow-100 text-yellow-800 ring-yellow-200"
      : s
      ? "bg-red-100 text-red-800 ring-red-200"
      : "bg-zinc-100 text-zinc-700 ring-zinc-200";

  const label =
    s === "paid"
      ? "已支付"
      : s === "pending" || s === "pending_payment"
      ? "待支付"
      : s
      ? s
      : "未知";

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${cls}`}>
      {label}
    </span>
  );
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, SearchValue>>;
}) {
  const supabase = supabaseAdmin();
  const sp = await searchParams;

  const qRaw = one(sp.q).slice(0, 60);
  const q = qRaw.replace(/[%_,]/g, " ").trim();
  const status = one(sp.status).toLowerCase() || "all";
  const from = one(sp.from);
  const to = one(sp.to);

  let ordersQuery = supabase
    .from("orders")
    .select("id, created_at, name, phone, visit_date, visit_time, party_size, amount_cents, currency, status, booking_id")
    .order("created_at", { ascending: false })
    .limit(120);

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

  const { data: rows, error } = await ordersQuery;

  type OrderRow = {
    id: string;
    created_at: string | null;
    name: string | null;
    phone: string | null;
    visit_date: string | null;
    visit_time: string | null;
    party_size: number | null;
    amount_cents: number | null;
    currency: string | null;
    status: string | null;
    booking_id: string | null;
  };

  const items: OrderRow[] = rows ?? [];
  const orderIds = items.map((it) => String(it.id)).filter(Boolean);

  type OrderItemRow = {
    order_id: string | null;
    item_name: string | null;
    qty: number | null;
    unit_price_cents: number | null;
  };

  let orderItemsMap = new Map<string, OrderItemRow[]>();
  let orderItemsError: string | null = null;

  if (orderIds.length > 0) {
    const { data: oiRows, error: oiErr } = await supabase
      .from("order_items")
      .select("order_id,item_name,qty,unit_price_cents")
      .in("order_id", orderIds);

    if (oiErr) {
      orderItemsError = oiErr.message;
    } else {
      const list = (oiRows ?? []) as OrderItemRow[];
      orderItemsMap = list.reduce((acc, row) => {
        const k = String(row.order_id ?? "");
        if (!k) return acc;
        const prev = acc.get(k) ?? [];
        prev.push(row);
        acc.set(k, prev);
        return acc;
      }, new Map<string, OrderItemRow[]>());
    }
  }

  const filterQuery = buildSearchParams({
    q: qRaw,
    status: status === "all" ? "" : status,
    from,
    to,
  });
  const exportHref = filterQuery ? `/admin/orders/export?${filterQuery}` : "/admin/orders/export";

  return (
    <main className="min-h-screen text-zinc-900">
      <Header />
      <section className="py-12">
        <Container>
          <div className="max-w-[1200px]">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="text-4xl font-black tracking-tight">后台订单</h1>
                <p className="mt-2 text-zinc-700">查看客户点单、支付状态与金额对账。</p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/admin/risk"
                  className="rounded-full border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold hover:bg-zinc-50"
                >
                  风险面板
                </Link>
                <Link
                  href="/admin/donations"
                  className="rounded-full border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold hover:bg-zinc-50"
                >
                  随喜
                </Link>
              </div>
            </div>

            <form method="GET" className="mt-6 grid gap-3 rounded-2xl border border-zinc-200 bg-white p-4 md:grid-cols-6">
              <input
                type="text"
                name="q"
                defaultValue={qRaw}
                placeholder="姓名 / 电话 / 订单ID"
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm md:col-span-2"
              />
              <select name="status" defaultValue={status} className="rounded-lg border border-zinc-300 px-3 py-2 text-sm">
                <option value="all">全部状态</option>
                <option value="pending">pending</option>
                <option value="pending_payment">pending_payment</option>
                <option value="paid">paid</option>
                <option value="cancelled">cancelled</option>
              </select>
              <input
                type="date"
                name="from"
                defaultValue={from}
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              />
              <input
                type="date"
                name="to"
                defaultValue={to}
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              />
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white"
                >
                  筛选
                </button>
                <Link
                  href="/admin/orders"
                  className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700"
                >
                  重置
                </Link>
              </div>
            </form>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
              <Link href={exportHref} className="rounded-lg border border-zinc-300 bg-white px-3 py-2 font-semibold">
                导出 CSV
              </Link>
              <span className="text-zinc-500">当前记录：{items.length}</span>
            </div>

            {error ? (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                读取失败：{error.message}
              </div>
            ) : null}
            {orderItemsError ? (
              <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                订单菜品读取失败：{orderItemsError}
              </div>
            ) : null}

            <div className="mt-6 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-zinc-200">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-zinc-50 text-zinc-700">
                    <tr>
                      <th className="px-5 py-4 text-left font-semibold">创建时间</th>
                      <th className="px-5 py-4 text-left font-semibold">姓名</th>
                      <th className="px-5 py-4 text-left font-semibold">电话</th>
                      <th className="px-5 py-4 text-left font-semibold">到访日期</th>
                      <th className="px-5 py-4 text-left font-semibold">到访时间</th>
                      <th className="px-5 py-4 text-left font-semibold">人数</th>
                      <th className="px-5 py-4 text-left font-semibold">金额</th>
                      <th className="px-5 py-4 text-left font-semibold">供斋内容</th>
                      <th className="px-5 py-4 text-left font-semibold">金额对账</th>
                      <th className="px-5 py-4 text-left font-semibold">状态</th>
                      <th className="px-5 py-4 text-left font-semibold">orderId</th>
                      <th className="px-5 py-4 text-left font-semibold">bookingId</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-zinc-100">
                    {items.length === 0 ? (
                      <tr>
                        <td className="px-5 py-6 text-zinc-600" colSpan={12}>
                          无记录
                        </td>
                      </tr>
                    ) : (
                      items.map((it) => {
                        const amountCents = typeof it.amount_cents === "number" ? it.amount_cents : null;
                        const currency = String(it.currency ?? "usd").toUpperCase();
                        const amountText =
                          amountCents == null ? "-" : `${(amountCents / 100).toFixed(2)} ${currency}`;
                        const createdAt = it.created_at ? new Date(it.created_at).toLocaleString() : "-";

                        const oi = orderItemsMap.get(String(it.id)) ?? [];
                        const orderedText =
                          oi.length === 0
                            ? "-"
                            : oi
                                .map((x) => {
                                  const nm = String(x.item_name ?? "").trim() || "未命名";
                                  const qNum = Number(x.qty ?? 0);
                                  return `${nm} × ${Number.isFinite(qNum) ? qNum : 0}`;
                                })
                                .join("，");

                        const sumCents = oi.reduce((sum, x) => {
                          const qNum = Number(x.qty ?? 0);
                          const up = Number(x.unit_price_cents ?? 0);
                          if (!Number.isFinite(qNum) || !Number.isFinite(up)) return sum;
                          return sum + qNum * up;
                        }, 0);
                        const reconciled =
                          amountCents != null && oi.length > 0 ? amountCents === sumCents : null;

                        return (
                          <tr key={String(it.id)} className="hover:bg-zinc-50/60">
                            <td className="px-5 py-4 whitespace-nowrap">{createdAt}</td>
                            <td className="px-5 py-4 whitespace-nowrap">{it.name ?? "-"}</td>
                            <td className="px-5 py-4 whitespace-nowrap">{it.phone ?? "-"}</td>
                            <td className="px-5 py-4 whitespace-nowrap">{it.visit_date ?? "-"}</td>
                            <td className="px-5 py-4 whitespace-nowrap">{it.visit_time ?? "-"}</td>
                            <td className="px-5 py-4 whitespace-nowrap">{it.party_size ?? "-"}</td>
                            <td className="px-5 py-4 whitespace-nowrap">{amountText}</td>
                            <td className="px-5 py-4 min-w-[260px] max-w-[360px] text-xs text-zinc-700">
                              <div className="line-clamp-3">{orderedText}</div>
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap text-xs">
                              {reconciled === null ? (
                                <span className="text-zinc-500">待核</span>
                              ) : reconciled ? (
                                <span className="rounded-full bg-green-100 px-2 py-1 font-semibold text-green-700">
                                  一致
                                </span>
                              ) : (
                                <span className="rounded-full bg-red-100 px-2 py-1 font-semibold text-red-700">
                                  不一致
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap">
                              <StatusPill status={it.status} />
                            </td>
                            <td className="px-5 py-4 font-mono text-xs whitespace-nowrap">{String(it.id)}</td>
                            <td className="px-5 py-4 font-mono text-xs whitespace-nowrap">
                              {it.booking_id ? String(it.booking_id) : "-"}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
