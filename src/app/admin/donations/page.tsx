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
      : s === "pending"
      ? "bg-yellow-100 text-yellow-800 ring-yellow-200"
      : s
      ? "bg-red-100 text-red-800 ring-red-200"
      : "bg-zinc-100 text-zinc-700 ring-zinc-200";
  const label = s || "未知";
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${cls}`}>
      {label}
    </span>
  );
}

export default async function AdminDonationsPage() {
  const supabase = supabaseAdmin();

  const { data: rows, error } = await supabase
    .from("donations")
    .select("id, created_at, amount_cents, currency, status, email, name, stripe_session_id")
    .order("created_at", { ascending: false })
    .limit(50);

  const items = rows ?? [];

  return (
    <main className="min-h-screen text-zinc-900">
      <Header />
      <section className="py-12">
        <Container>
          <div className="max-w-6xl">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h1 className="text-4xl font-black tracking-tight">后台随喜</h1>
                <p className="mt-2 text-zinc-700">
                  最近 50 条随喜记录（只读）。
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="/admin/orders"
                  className="rounded-full border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold hover:bg-zinc-50"
                >
                  订单
                </a>
                <a
                  href="/"
                  className="rounded-full border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold hover:bg-zinc-50"
                >
                  返回首页
                </a>
              </div>
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
                      <th className="px-5 py-4 text-left font-semibold">邮箱</th>
                      <th className="px-5 py-4 text-left font-semibold">金额</th>
                      <th className="px-5 py-4 text-left font-semibold">状态</th>
                      <th className="px-5 py-4 text-left font-semibold">donationId</th>
                      <th className="px-5 py-4 text-left font-semibold">stripeSession</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-zinc-100">
                    {items.length === 0 ? (
                      <tr>
                        <td className="px-5 py-6 text-zinc-600" colSpan={7}>
                          暂无随喜记录
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
                            <td className="px-5 py-4 whitespace-nowrap">{it.email ?? "-"}</td>
                            <td className="px-5 py-4 whitespace-nowrap">{amountText}</td>
                            <td className="px-5 py-4 whitespace-nowrap">
                              <StatusPill status={it.status} />
                            </td>
                            <td className="px-5 py-4 font-mono text-xs whitespace-nowrap">{String(it.id)}</td>
                            <td className="px-5 py-4 font-mono text-xs whitespace-nowrap">
                              {it.stripe_session_id ? String(it.stripe_session_id) : "-"}
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
