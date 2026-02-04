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

const CATEGORY_NOTE: Record<string, string> = {
  main: "以清淡为本，留住一餐的安稳。",
  side: "少而有味，恰到好处。",
  soup: "温润入心，安住身心。",
  dessert: "随缘之甜，点到即止。",
  drink: "清润相伴，轻声慢饮。",
  other: "当日随缘供斋。",
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

      <section className="section pb-24 relative overflow-hidden fade-in">
        <div className="pointer-events-none absolute inset-0 lotus-pattern opacity-[0.12]" />
        <Container className="relative z-10">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="max-w-2xl relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200/70 bg-white/70 px-4 py-1 text-xs font-medium text-zinc-600">
                清净供斋
              </div>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight serif-title">今日供斋</h1>
              <p className="mt-3 text-sm text-neutral-600">
                供斋随缘，今日所供随时令而变，清淡而温润。
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                  { title: "清淡供斋", note: "当季食材" },
                  { title: "安静到访", note: "轻声慢行" },
                  { title: "随缘护持", note: "功德回向" },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-zinc-200/70 bg-white/80 px-4 py-4 text-xs text-zinc-600 soft-card"
                  >
                    <div className="text-sm font-semibold text-zinc-900">{item.title}</div>
                    <div className="mt-1 text-[11px] text-zinc-500">{item.note}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-3xl border border-zinc-200/70 bg-white/80 p-5 text-sm text-zinc-700 shadow-sm soft-card sutra-block">
                今日供斋以当季为主，清淡而温润。若需改期或退款，请联系管理员协助。
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[28px] border border-zinc-200/70 bg-white/80 p-6 shadow-sm soft-card hover-scale">
              <div
                className="absolute inset-0 opacity-90"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0.95) 100%), url("/hero.svg") center/cover no-repeat',
                }}
              />
              <div
                className="absolute right-6 top-6 h-14 w-14 opacity-60"
                style={{ background: 'url("/lotus.svg") center/contain no-repeat' }}
              />
              <div className="relative z-10 hover-target">
                <div className="text-xs font-semibold text-zinc-500">今日供斋</div>
                <div className="mt-2 text-lg font-semibold text-zinc-900">清淡 · 安住 · 随缘</div>
                <p className="mt-2 text-sm text-zinc-700">
                  供斋随日而更，取当季食材，以朴素滋味安住身心。
                </p>

                <ScriptureQuote compact className="mt-5 bg-white/90" variant="meal" />
              </div>
            </div>
          </div>

          <div className="mt-12">
            <div className="mb-8 ink-divider" />
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
              <div className="space-y-12">
                {categories.map((cat) => (
                  <section key={cat} className="rounded-3xl border border-zinc-200/70 bg-white/80 p-6 shadow-sm soft-card fade-in">
                    <div className="grid gap-6 lg:grid-cols-[220px_1fr] lg:items-start">
                      <div>
                        <div className="text-xs font-semibold text-zinc-500">供斋</div>
                        <h2 className="mt-2 text-2xl font-semibold serif-title text-zinc-900">
                          {CATEGORY_LABEL[cat] || "其他"}
                        </h2>
                        <p className="mt-3 text-sm text-zinc-600">
                          {CATEGORY_NOTE[cat] || "当日随缘供斋。"}
                        </p>
                        <div className="mt-4 text-xs text-zinc-500">清净 · 随缘 · 当季</div>
                      </div>

                      <div className="grid gap-5 md:grid-cols-2">
                        {grouped[cat].map((it, index) => {
                          const img = normalizeUrl(it.image_url);
                          const imageSrc = img || "/dish-placeholder.svg";
                          const unit = Number(it.price_cents ?? 0);

                          return (
                            <div
                              key={it.id}
                              className="group relative overflow-hidden rounded-2xl border border-zinc-200/70 bg-white/85 p-4 shadow-sm soft-card hover-scale lift-shadow fade-in"
                              style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex min-w-0 gap-4">
                                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 hover-target">
                                    <Image
                                      src={imageSrc}
                                      alt={it.name}
                                      fill
                                      className={img ? "object-cover" : "object-contain p-3 opacity-80"}
                                      sizes="80px"
                                      unoptimized
                                    />
                                  </div>

                                  <div className="min-w-0">
                                    <div className="truncate text-base font-semibold text-zinc-900">{it.name}</div>
                                    {it.description ? (
                                      <div className="mt-1 line-clamp-2 text-sm text-neutral-600">
                                        {it.description}
                                      </div>
                                    ) : (
                                      <div className="mt-1 text-xs text-zinc-500">当日随缘</div>
                                    )}
                                    <div className="mt-3 text-sm font-semibold text-zinc-900">
                                      {formatPrice(it.price_cents)}
                                    </div>
                                  </div>
                                </div>

                                <div className="shrink-0 pt-1">
                                  {it.price_cents !== null ? (
                                    <AddToCartButton
                                      id={it.id}
                                      name={it.name}
                                      priceCents={unit}
                                    />
                                  ) : null}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>

          <div className="mt-10 rounded-3xl border border-zinc-200/70 bg-white/80 p-6 text-sm text-zinc-700 shadow-sm soft-card">
            请轻声交流，缓慢用斋。若需改期或退款，请联系管理员协助。
            <div className="mt-3 text-xs text-zinc-500">
              建议至少提前一天告知，以便安排席位与准备供斋。
            </div>
          </div>

          <div className="mt-8">
            <OfferingsPanel />
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            {[
              { title: "清净供斋", note: "实景照片待更新" },
              { title: "简而有心", note: "以当季食材为准" },
            ].map((item, idx) => (
              <div
                key={item.title}
                className={`overflow-hidden rounded-3xl border border-zinc-200/70 bg-white/80 p-4 shadow-sm soft-card hover-scale ${
                  idx === 1 ? "lg:mt-10" : ""
                }`}
              >
                <div className={`relative w-full overflow-hidden rounded-2xl hover-scale ${idx === 0 ? "h-44" : "h-36"}`}>
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
