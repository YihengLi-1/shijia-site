import Header from "@/components/Header";
import Container from "@/components/Container";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function supabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key, { auth: { persistSession: false } });
}

type OrderLite = {
  id: string;
  created_at: string | null;
  status: string | null;
  amount_cents: number | null;
  phone: string | null;
  name: string | null;
};

type ItemLite = {
  order_id: string | null;
  qty: number | null;
  unit_price_cents: number | null;
};

export default async function AdminRiskPage() {
  const supabase = supabaseAdmin();
  const now = Date.now();
  const staleCutoff = new Date(now - 30 * 60 * 1000).toISOString();
  const dayCutoff = new Date(now - 24 * 60 * 60 * 1000).toISOString();

  const { data: recentOrders, error: recentErr } = await supabase
    .from("orders")
    .select("id,created_at,status,amount_cents,phone,name")
    .order("created_at", { ascending: false })
    .limit(300);

  const recent = (recentOrders ?? []) as OrderLite[];
  const ids = recent.map((o) => String(o.id)).filter(Boolean);

  let itemsMap = new Map<string, ItemLite[]>();
  if (ids.length > 0) {
    const { data: orderItems } = await supabase
      .from("order_items")
      .select("order_id,qty,unit_price_cents")
      .in("order_id", ids);

    const list = (orderItems ?? []) as ItemLite[];
    itemsMap = list.reduce((acc, row) => {
      const k = String(row.order_id ?? "");
      if (!k) return acc;
      const prev = acc.get(k) ?? [];
      prev.push(row);
      acc.set(k, prev);
      return acc;
    }, new Map<string, ItemLite[]>());
  }

  const mismatchOrders = recent
    .map((o) => {
      const oi = itemsMap.get(String(o.id)) ?? [];
      if (oi.length === 0) return null;
      const itemsAmount = oi.reduce((sum, x) => {
        const qty = Number(x.qty ?? 0);
        const up = Number(x.unit_price_cents ?? 0);
        if (!Number.isFinite(qty) || !Number.isFinite(up)) return sum;
        return sum + qty * up;
      }, 0);
      const orderAmount = Number(o.amount_cents ?? 0);
      if (!Number.isFinite(orderAmount) || orderAmount === itemsAmount) return null;
      return { ...o, itemsAmount };
    })
    .filter(Boolean) as Array<OrderLite & { itemsAmount: number }>;

  const { data: stalePending, error: staleErr } = await supabase
    .from("orders")
    .select("id,created_at,status,amount_cents,phone,name")
    .in("status", ["pending", "pending_payment"])
    .lt("created_at", staleCutoff)
    .order("created_at", { ascending: true })
    .limit(120);

  const staleRows = (stalePending ?? []) as OrderLite[];

  const { data: dayOrders, error: dayErr } = await supabase
    .from("orders")
    .select("id,created_at,status,phone,name")
    .gt("created_at", dayCutoff)
    .order("created_at", { ascending: false })
    .limit(500);

  const phoneAgg = new Map<string, { count: number; latestAt: string; names: Set<string> }>();
  for (const row of dayOrders ?? []) {
    const phone = String((row as any).phone ?? "").trim();
    if (!phone) continue;
    const createdAt = String((row as any).created_at ?? "");
    const name = String((row as any).name ?? "").trim();
    const prev = phoneAgg.get(phone) ?? { count: 0, latestAt: "", names: new Set<string>() };
    prev.count += 1;
    if (!prev.latestAt || createdAt > prev.latestAt) prev.latestAt = createdAt;
    if (name) prev.names.add(name);
    phoneAgg.set(phone, prev);
  }
  const highFreqPhones = Array.from(phoneAgg.entries())
    .filter(([, v]) => v.count >= 3)
    .sort((a, b) => b[1].count - a[1].count);

  return (
    <main className="min-h-screen text-zinc-900">
      <Header />
      <section className="py-12">
        <Container>
          <div className="max-w-[1200px]">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="text-4xl font-black tracking-tight">风险面板</h1>
                <p className="mt-2 text-zinc-700">订单金额异常、超时未付与高频号码监控。</p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/admin/orders"
                  className="rounded-full border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold hover:bg-zinc-50"
                >
                  返回订单
                </Link>
                <Link
                  href="/admin/donations"
                  className="rounded-full border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold hover:bg-zinc-50"
                >
                  随喜
                </Link>
              </div>
            </div>

            {(recentErr || staleErr || dayErr) && (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                读取异常：
                {[recentErr?.message, staleErr?.message, dayErr?.message].filter(Boolean).join(" | ")}
              </div>
            )}

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-zinc-200 bg-white p-5">
                <div className="text-xs text-zinc-500">金额异常订单</div>
                <div className="mt-2 text-3xl font-bold">{mismatchOrders.length}</div>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-5">
                <div className="text-xs text-zinc-500">超时未支付（30m+）</div>
                <div className="mt-2 text-3xl font-bold">{staleRows.length}</div>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-5">
                <div className="text-xs text-zinc-500">高频号码（24h, 3+ 单）</div>
                <div className="mt-2 text-3xl font-bold">{highFreqPhones.length}</div>
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-zinc-200 bg-white p-4">
              <div className="text-sm font-semibold">金额异常订单（最近）</div>
              <div className="mt-3 overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-zinc-50 text-zinc-700">
                    <tr>
                      <th className="px-3 py-2 text-left">创建时间</th>
                      <th className="px-3 py-2 text-left">orderId</th>
                      <th className="px-3 py-2 text-left">订单金额</th>
                      <th className="px-3 py-2 text-left">菜品金额</th>
                      <th className="px-3 py-2 text-left">电话</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {mismatchOrders.length === 0 ? (
                      <tr>
                        <td className="px-3 py-3 text-zinc-600" colSpan={5}>无</td>
                      </tr>
                    ) : (
                      mismatchOrders.slice(0, 50).map((it) => (
                        <tr key={it.id}>
                          <td className="px-3 py-2 whitespace-nowrap">{it.created_at ? new Date(it.created_at).toLocaleString() : "-"}</td>
                          <td className="px-3 py-2 font-mono text-xs">{it.id}</td>
                          <td className="px-3 py-2">{it.amount_cents ?? "-"}</td>
                          <td className="px-3 py-2">{it.itemsAmount}</td>
                          <td className="px-3 py-2">{it.phone ?? "-"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-zinc-200 bg-white p-4">
              <div className="text-sm font-semibold">超时未支付</div>
              <div className="mt-3 overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-zinc-50 text-zinc-700">
                    <tr>
                      <th className="px-3 py-2 text-left">创建时间</th>
                      <th className="px-3 py-2 text-left">orderId</th>
                      <th className="px-3 py-2 text-left">状态</th>
                      <th className="px-3 py-2 text-left">金额</th>
                      <th className="px-3 py-2 text-left">电话</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {staleRows.length === 0 ? (
                      <tr>
                        <td className="px-3 py-3 text-zinc-600" colSpan={5}>无</td>
                      </tr>
                    ) : (
                      staleRows.map((it) => (
                        <tr key={it.id}>
                          <td className="px-3 py-2 whitespace-nowrap">{it.created_at ? new Date(it.created_at).toLocaleString() : "-"}</td>
                          <td className="px-3 py-2 font-mono text-xs">{it.id}</td>
                          <td className="px-3 py-2">{it.status ?? "-"}</td>
                          <td className="px-3 py-2">{it.amount_cents ?? "-"}</td>
                          <td className="px-3 py-2">{it.phone ?? "-"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-zinc-200 bg-white p-4">
              <div className="text-sm font-semibold">高频号码（24小时）</div>
              <div className="mt-3 overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-zinc-50 text-zinc-700">
                    <tr>
                      <th className="px-3 py-2 text-left">电话</th>
                      <th className="px-3 py-2 text-left">次数</th>
                      <th className="px-3 py-2 text-left">最近时间</th>
                      <th className="px-3 py-2 text-left">姓名</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {highFreqPhones.length === 0 ? (
                      <tr>
                        <td className="px-3 py-3 text-zinc-600" colSpan={4}>无</td>
                      </tr>
                    ) : (
                      highFreqPhones.map(([phone, agg]) => (
                        <tr key={phone}>
                          <td className="px-3 py-2">{phone}</td>
                          <td className="px-3 py-2">{agg.count}</td>
                          <td className="px-3 py-2">{agg.latestAt ? new Date(agg.latestAt).toLocaleString() : "-"}</td>
                          <td className="px-3 py-2">{Array.from(agg.names).join(" / ") || "-"}</td>
                        </tr>
                      ))
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
