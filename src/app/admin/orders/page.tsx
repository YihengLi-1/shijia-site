import Header from "@/components/Header";
import Container from "@/components/Container";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function supabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key, { auth: { persistSession: false } });
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

export default async function AdminOrdersPage() {
  const supabase = supabaseAdmin();

  // 只读最近 50 条订单
  const { data: rows, error } = await supabase
    .from("orders")
    .select("id, created_at, name, phone, visit_date, visit_time, party_size, amount_cents, currency, status, booking_id")
    .order("created_at", { ascending: false })
    .limit(50);

  const items = rows ?? [];

  return (
    <main className="min-h-screen bg-pink-200/60 text-zinc-900">
      <Header />
      <section className="py-12">
        <Container>
          <div className="max-w-6xl">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h1 className="text-4xl font-black tracking-tight">后台订单</h1>
                <p className="mt-2 text-zinc-700">
                  最近 50 条订单（只读）。用于快速查看预约/支付状态。
                </p>
              </div>

              <a
                href="/"
                className="rounded-full border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold hover:bg-zinc-50"
              >
                返回首页
              </a>
            </div>

            {error ? (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                读取失败：{error.message}
              </div>
            ) : null}

            <div className="mt-8 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-zinc-200">
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
                      <th className="px-5 py-4 text-left font-semibold">状态</th>
                      <th className="px-5 py-4 text-left font-semibold">orderId</th>
                      <th className="px-5 py-4 text-left font-semibold">bookingId</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-zinc-100">
                    {items.length === 0 ? (
                      <tr>
                        <td className="px-5 py-6 text-zinc-600" colSpan={10}>
                          暂无订单
                        </td>
                      </tr>
                    ) : (
                      items.map((it: any) => {
                        const amountCents = typeof it.amount_cents === "number" ? it.amount_cents : null;
                        const currency = String(it.currency ?? "usd").toUpperCase();
                        const amountText =
                          amountCents == null ? "-" : `${(amountCents / 100).toFixed(2)} ${currency}`;

                        const createdAt = it.created_at
                          ? new Date(it.created_at).toLocaleString()
                          : "-";

                        return (
                          <tr key={String(it.id)} className="hover:bg-zinc-50/60">
                            <td className="px-5 py-4 whitespace-nowrap">{createdAt}</td>
                            <td className="px-5 py-4 whitespace-nowrap">{it.name ?? "-"}</td>
                            <td className="px-5 py-4 whitespace-nowrap">{it.phone ?? "-"}</td>
                            <td className="px-5 py-4 whitespace-nowrap">{it.visit_date ?? "-"}</td>
                            <td className="px-5 py-4 whitespace-nowrap">{it.visit_time ?? "-"}</td>
                            <td className="px-5 py-4 whitespace-nowrap">{it.party_size ?? "-"}</td>
                            <td className="px-5 py-4 whitespace-nowrap">{amountText}</td>
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

              <div className="border-t border-zinc-200 px-5 py-4 text-xs text-zinc-500">
                提示：这是 A 版（无登录）。上线前我们会加保护（至少一个密码/登录）。
              </div>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}