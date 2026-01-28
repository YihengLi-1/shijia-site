// src/app/menu/page.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import Container from "@/components/Container";
import { addToCart, useCart } from "@/lib/cartStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  price_cents: number | null;
  image_url?: string | null;
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

function formatCartTotal(totalCents: number) {
  return `$${(totalCents / 100).toFixed(2)}`;
}

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState<string | null>(null);

  const cart = useCart();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setLoadErr(null);
        const res = await fetch("/api/menu", { cache: "no-store" });
        const json = await res.json().catch(() => null);
        const next: MenuItem[] = json?.items ?? [];
        if (!alive) return;
        setItems(next);
      } catch (e: any) {
        if (!alive) return;
        setLoadErr(String(e?.message ?? e ?? "menu_fetch_failed"));
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const grouped = useMemo(() => {
    return items.reduce<Record<string, MenuItem[]>>((acc, it) => {
      const key = (it.category || "other").toLowerCase();
      (acc[key] ||= []).push(it);
      return acc;
    }, {});
  }, [items]);

  const categories = useMemo(() => {
    const order = ["main", "side", "soup", "dessert", "drink", "other"];
    return Object.keys(grouped).sort((a, b) => order.indexOf(a) - order.indexOf(b));
  }, [grouped]);

  const qtyById = useMemo(() => {
    const map = new Map<string, number>();
    for (const it of cart.items) map.set(it.menuItemId, it.qty);
    return map;
  }, [cart.items]);

  const cartCount = useMemo(() => cart.items.reduce((s, it) => s + it.qty, 0), [cart.items]);

  return (
    <main className="min-h-screen bg-pink-200/60 text-zinc-900">
      <Header />

      <section className="py-12">
        <Container>
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">素食菜单</h1>
              <p className="mt-2 text-sm text-neutral-600">供斋随缘，菜单与供应以当日为准。</p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium hover:border-zinc-400"
              >
                返回首页
              </Link>

              <Link
                href="/book"
                className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
              >
                去预约结账
                <span className="ml-2 inline-flex min-w-6 items-center justify-center rounded-full bg-white/15 px-2 py-0.5 text-xs">
                  {cartCount}
                </span>
              </Link>

              <div className="text-sm text-zinc-700">
                小计：<span className="font-semibold">{formatCartTotal(cart.totalCents)}</span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-neutral-700">
              正在加载菜单…
            </div>
          ) : loadErr ? (
            <div className="rounded-2xl border border-red-200 bg-white p-6 text-red-700">
              菜单加载失败：{loadErr}
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-neutral-700">
              暂无可展示菜单（请先在后台 menu_items 表插入数据）。
            </div>
          ) : (
            <div className="space-y-6">
              {categories.map((cat) => (
                <section key={cat} className="rounded-2xl border bg-white p-6">
                  <h2 className="text-xl font-semibold">{CATEGORY_LABEL[cat] || "其他"}</h2>

                  <div className="mt-4 divide-y">
                    {grouped[cat].map((it) => {
                      const img = normalizeUrl(it.image_url);
                      const qty = qtyById.get(it.id) ?? 0;
                      const unit = Number(it.price_cents ?? 0);

                      return (
                        <div key={it.id} className="py-4">
                          <div className="flex items-start justify-between gap-6">
                            {/* 左侧：图 + 文案 */}
                            <div className="flex min-w-0 gap-4">
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
                                <div className="truncate font-medium">{it.name}</div>
                                {it.description ? (
                                  <div className="mt-1 line-clamp-2 text-sm text-neutral-600">
                                    {it.description}
                                  </div>
                                ) : null}
                              </div>
                            </div>

                            {/* 右侧：价格 + 加减 */}
                            <div className="shrink-0 text-right">
                              <div className="font-medium">{formatPrice(it.price_cents)}</div>

                              <div className="mt-2 flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (qty <= 0) return;
                                    addToCart(
                                      { menuItemId: it.id, name: it.name, unitPriceCents: unit },
                                      -1
                                    );
                                  }}
                                  className="h-8 w-8 rounded-full border border-zinc-300 bg-white text-sm font-semibold hover:border-zinc-400 disabled:opacity-40"
                                  disabled={qty <= 0}
                                  aria-label="减少数量"
                                >
                                  −
                                </button>

                                <div className="w-10 text-center text-sm font-medium">{qty}</div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    addToCart(
                                      { menuItemId: it.id, name: it.name, unitPriceCents: unit },
                                      1
                                    );
                                  }}
                                  className="h-8 w-8 rounded-full border border-zinc-300 bg-white text-sm font-semibold hover:border-zinc-400"
                                  aria-label="增加数量"
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

          <div className="mt-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white p-4">
            <div className="text-sm text-zinc-700">
              当前已选 <span className="font-semibold">{cartCount}</span> 份｜小计{" "}
              <span className="font-semibold">{formatCartTotal(cart.totalCents)}</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => cart.clearCart()}
                className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium hover:border-zinc-400"
              >
                清空
              </button>

              <Link
                href="/book"
                className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
              >
                去预约结账
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}