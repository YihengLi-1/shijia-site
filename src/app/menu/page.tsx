// src/app/menu/page.tsx
"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import Container from "@/components/Container";
import AddToCartButton from "@/components/AddToCartButton";
import Footer from "@/components/Footer";
import ScriptureQuote from "@/components/ScriptureQuote";
import OfferingsPanel from "@/components/OfferingsPanel";
import BookingDock from "./BookingDock";

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

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState<string | null>(null);

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

  return (
    <main className="min-h-screen text-zinc-900">
      <Header />

      <section className="section pb-24 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 lotus-pattern opacity-30" />
        <Container className="relative z-10">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200/70 bg-white/70 px-4 py-1 text-xs font-medium text-zinc-600">
                清净供斋
              </div>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight serif-title">今日供斋</h1>
              <p className="mt-3 text-sm text-neutral-600">
                供斋随缘，今日所供随时令而变，清淡而温润。
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-zinc-600">
                <span className="rounded-full border border-zinc-200 bg-white px-3 py-1">
                  当日供斋
                </span>
                <span className="rounded-full border border-zinc-200 bg-white px-3 py-1">
                  以现场为准
                </span>
                <span className="rounded-full border border-zinc-200 bg-white px-3 py-1">
                  数量有限
                </span>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[28px] border border-zinc-200/70 bg-white/80 p-6 shadow-sm soft-card">
              <div
                className="absolute inset-0 opacity-90"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0.95) 100%), url("/hero.svg") center/cover no-repeat',
                }}
              />
              <div
                className="absolute right-6 top-6 h-14 w-14 opacity-60 float-slow"
                style={{ background: 'url("/lotus.svg") center/contain no-repeat' }}
              />
              <div className="relative z-10">
                <div className="text-xs font-semibold text-zinc-500">今日供斋</div>
                <div className="mt-2 text-lg font-semibold text-zinc-900">清淡 · 安住 · 随缘</div>
                <p className="mt-2 text-sm text-zinc-700">
                  供斋随日而更，取当季食材，以朴素滋味安住身心。
                </p>

                <ScriptureQuote compact className="mt-5 bg-white/90" />

                <div className="mt-5 flex flex-wrap gap-2 text-xs text-zinc-600">
                  <span className="rounded-full border border-zinc-200 bg-white px-3 py-1">
                    时令蔬菜
                  </span>
                  <span className="rounded-full border border-zinc-200 bg-white px-3 py-1">
                    清淡汤品
                  </span>
                  <span className="rounded-full border border-zinc-200 bg-white px-3 py-1">
                    当日主食
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12">
            {loading ? (
              <div className="rounded-2xl border border-zinc-200/70 bg-white/80 p-6 text-neutral-700">
                正在加载供斋…
              </div>
            ) : loadErr ? (
              <div className="rounded-2xl border border-red-200 bg-white/80 p-6 text-red-700">
                供斋信息暂时无法加载，请稍后再试或联系管理员。
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-2xl border border-zinc-200/70 bg-white/80 p-6 text-neutral-700">
                今日供斋尚未更新，请稍后再来。
              </div>
            ) : (
              <div className="space-y-8">
                {categories.map((cat) => (
                  <section key={cat} className="rounded-2xl border border-zinc-200/70 bg-white/80 p-6 shadow-sm soft-card">
                    <h2 className="text-xl font-semibold">{CATEGORY_LABEL[cat] || "其他"}</h2>

                    <div className="mt-4 divide-y">
                      {grouped[cat].map((it) => {
                        const img = normalizeUrl(it.image_url);
                        const imageSrc = img || "/dish-placeholder.svg";
                        const unit = Number(it.price_cents ?? 0);

                        return (
                        <div key={it.id} className="py-4 rounded-2xl px-2 -mx-2 transition hover:bg-white/70">
                          <div className="flex items-start justify-between gap-6">
                              {/* 左侧：图 + 文案 */}
                              <div className="flex min-w-0 gap-4">
                                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
                                  <Image
                                    src={imageSrc}
                                    alt={it.name}
                                    fill
                                    className={img ? "object-cover" : "object-contain p-2 opacity-80"}
                                    sizes="64px"
                                    unoptimized
                                  />
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

                              {/* 右侧：价格 + 购物车按钮 */}
                              <div className="shrink-0 text-right">
                                <div className="font-medium">{formatPrice(it.price_cents)}</div>

                                {it.price_cents !== null ? (
                                  <div className="mt-2 flex justify-end">
                                    <AddToCartButton
                                      id={it.id}
                                      name={it.name}
                                      priceCents={unit}
                                    />
                                  </div>
                                ) : null}
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
          </div>

          <div className="mt-10 rounded-3xl border border-zinc-200/70 bg-white/80 p-6 text-sm text-zinc-700 shadow-sm soft-card">
            请轻声交流，缓慢用斋。若需改期或退款，请联系管理员人工处理。
          </div>

          <div className="mt-8">
            <OfferingsPanel />
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {[
              { title: "清净供斋", note: "实景照片待更新" },
              { title: "简而有心", note: "以当季食材为准" },
            ].map((item) => (
              <div
                key={item.title}
                className="overflow-hidden rounded-3xl border border-zinc-200/70 bg-white/80 p-4 shadow-sm soft-card"
              >
                <div className="relative h-32 w-full overflow-hidden rounded-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-stone-100 via-stone-200/60 to-stone-100" />
                  <div
                    className="absolute -right-6 -top-8 h-20 w-20 opacity-40"
                    style={{ background: 'url("/lotus.svg") center/contain no-repeat' }}
                  />
                  <div className="absolute inset-0 border border-white/60" />
                </div>
                <div className="mt-3 text-sm font-semibold text-zinc-800">{item.title}</div>
                <div className="mt-1 text-xs text-zinc-500">{item.note}</div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <BookingDock />

      <Footer />
    </main>
  );
}
