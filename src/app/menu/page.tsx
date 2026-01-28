// src/app/menu/page.tsx
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Container from "@/components/Container";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  price_cents: number | null;
  image_url?: string | null; // ✅ 新增
};

const CATEGORY_LABEL: Record<string, string> = {
  main: "主食",
  side: "小菜",
  soup: "汤品",
  dessert: "甜品",
  drink: "饮品",
  other: "其他",
};

function formatPrice(cents: number | null) {
  if (cents === null || cents === undefined) return "—";
  return `$${(cents / 100).toFixed(2)}`;
}

function normalizeUrl(u?: string | null) {
  const s = (u ?? "").trim();
  return s.length ? s : null;
}

export default async function MenuPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/menu`, {
    cache: "no-store",
  });

  const json = await res.json().catch(() => null);
  const items: MenuItem[] = json?.items ?? [];

  const grouped = items.reduce<Record<string, MenuItem[]>>((acc, it) => {
    const key = (it.category || "other").toLowerCase();
    (acc[key] ||= []).push(it);
    return acc;
  }, {});

  const order = ["main", "side", "soup", "dessert", "drink", "other"];
  const categories = Object.keys(grouped).sort(
    (a, b) => order.indexOf(a) - order.indexOf(b)
  );

  return (
    <main className="min-h-screen bg-pink-200/60 text-zinc-900">
      <Header />

      <section className="py-12">
        <Container>
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">素食菜单</h1>
              <p className="mt-2 text-sm text-neutral-600">
                供斋随缘，菜单与供应以当日为准。
              </p>
            </div>

            {/* ✅ 返回按钮 */}
            <Link
              href="/"
              className="shrink-0 rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium hover:border-zinc-400"
            >
              返回首页
            </Link>
          </div>

          {items.length === 0 ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-neutral-700">
              暂无可展示菜单（请先在后台 menu_items 表插入数据）。
            </div>
          ) : (
            <div className="space-y-6">
              {categories.map((cat) => (
                <section key={cat} className="rounded-2xl border bg-white p-6">
                  <h2 className="text-xl font-semibold">
                    {CATEGORY_LABEL[cat] || "其他"}
                  </h2>

                  <div className="mt-4 divide-y">
                    {grouped[cat].map((it) => {
                      const img = normalizeUrl(it.image_url);

                      return (
                        <div key={it.id} className="py-4">
                          <div className="flex items-start justify-between gap-6">
                            {/* 左侧：图 + 文案 */}
                            <div className="flex min-w-0 gap-4">
                              {/* 图（有就显示，没有就占位） */}
                              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
                                {img ? (
                                  <Image
                                    src={img}
                                    alt={it.name}
                                    fill
                                    className="object-cover"
                                    sizes="64px"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-[10px] text-zinc-400">
                                    暂无图片
                                  </div>
                                )}
                              </div>

                              <div className="min-w-0">
                                <div className="truncate font-medium">
                                  {it.name}
                                </div>
                                {it.description ? (
                                  <div className="mt-1 line-clamp-2 text-sm text-neutral-600">
                                    {it.description}
                                  </div>
                                ) : null}
                              </div>
                            </div>

                            {/* 右侧：价格 */}
                            <div className="shrink-0 font-medium">
                              {formatPrice(it.price_cents)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          )}
        </Container>
      </section>
    </main>
  );
}