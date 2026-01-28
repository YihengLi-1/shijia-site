// src/app/menu/MenuClient.tsx
"use client";

import Link from "next/link";
import { useCart } from "@/lib/cartStore";

type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  price_cents: number | null;
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

export default function MenuClient({ items }: { items: MenuItem[] }) {
  const cart = useCart();

  const grouped = items.reduce<Record<string, MenuItem[]>>((acc, it) => {
    const key = (it.category || "other").toLowerCase();
    (acc[key] ||= []).push(it);
    return acc;
  }, {});

  const order = ["main", "side", "soup", "dessert", "drink", "other"];
  const categories = Object.keys(grouped).sort(
    (a, b) => order.indexOf(a) - order.indexOf(b)
  );

  const qtyOf = (menuItemId: string) =>
    cart.items.find((x) => x.menuItemId === menuItemId)?.qty ?? 0;

  return (
    <>
      {/* 顶部：返回 + 购物车摘要 */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/"
          className="w-fit rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium hover:border-zinc-400"
        >
          返回首页
        </Link>

        <div className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3 sm:min-w-[340px]">
          <div className="text-sm text-zinc-700">
            购物车：<span className="font-medium">{cart.items.length}</span> 种，
            合计：<span className="font-medium">{formatPrice(cart.totalCents)}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => cart.clearCart()}
              className="rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium hover:border-zinc-400 disabled:opacity-40"
              disabled={cart.items.length === 0}
            >
              清空
            </button>

            {/* 下一步我们把它联动到 /book 或 /checkout */}
            <Link
              href="/book"
              className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              去预约结算
            </Link>
          </div>
        </div>
      </div>

      {/* 菜单列表：每行 +- */}
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
                  const unit = it.price_cents ?? 0;
                  const qty = qtyOf(it.id);

                  return (
                    <div key={it.id} className="py-4">
                      <div className="flex items-start justify-between gap-6">
                        <div className="min-w-0">
                          <div className="font-medium">{it.name}</div>
                          {it.description ? (
                            <div className="mt-1 text-sm text-neutral-600">
                              {it.description}
                            </div>
                          ) : null}
                        </div>

                        <div className="flex shrink-0 items-center gap-3">
                          <div className="w-20 text-right font-medium">
                            {formatPrice(it.price_cents)}
                          </div>

                          <div className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-2 py-1">
                            <button
                              onClick={() =>
                                cart.addToCart(
                                  {
                                    menuItemId: it.id,
                                    name: it.name,
                                    unitPriceCents: unit,
                                  },
                                  -1
                                )
                              }
                              className="h-7 w-7 rounded-full border border-zinc-300 text-sm font-semibold hover:border-zinc-400 disabled:opacity-40"
                              disabled={qty === 0}
                              aria-label="minus"
                            >
                              −
                            </button>

                            <div className="w-6 text-center text-sm font-medium">
                              {qty}
                            </div>

                            <button
                              onClick={() =>
                                cart.addToCart({
                                  menuItemId: it.id,
                                  name: it.name,
                                  unitPriceCents: unit,
                                })
                              }
                              className="h-7 w-7 rounded-full border border-zinc-300 text-sm font-semibold hover:border-zinc-400"
                              aria-label="plus"
                            >
                              +
                            </button>
                          </div>
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
    </>
  );
}