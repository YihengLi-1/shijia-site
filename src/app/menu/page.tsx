// src/app/menu/page.tsx
"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import Container from "@/components/Container";
import AddToCartButton from "@/components/AddToCartButton";
import Footer from "@/components/Footer";
import ScriptureQuote from "@/components/ScriptureQuote";
import RitualScroll from "@/components/RitualScroll";
import ChipReveal from "@/components/ChipReveal";
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
  main: "当季为主，淡中见味。",
  side: "少而恰当，轻而不失。",
  soup: "温润入心，安住当下。",
  dessert: "随缘一口，不求过多。",
  drink: "清润相伴，慢慢品尝。",
  other: "随缘备办。",
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
      <Header hideCta />

      <section className="section pb-16 relative overflow-hidden fade-in temple-veil temple-hero">
        <div className="pointer-events-none absolute inset-0 lotus-pattern opacity-[0.1]" />
        <Container className="relative z-10">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200/70 bg-white/70 px-4 py-1 text-xs font-medium text-zinc-600">
                今日供斋
              </div>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight serif-title">今日供斋</h1>
              <p className="mt-3 text-sm text-zinc-600">
                今日所供随时令而变，清淡有度。愿您在此一餐，心与味同静。
              </p>
              <div className="mt-4">
                <ChipReveal
                  items={[
                    { label: "当日随缘", note: "所供随缘，当天略有不同。" },
                    { label: "当季食材", note: "随季而变，清淡有度。" },
                    { label: "需提前预约", note: "提前留席，以便安排供斋。" },
                  ]}
                />
              </div>

              <div className="mt-6 text-xs text-zinc-500">
                确认后将为您留席并发送提醒；如需改期，请联系管理员协助。
              </div>

              <ScriptureQuote compact className="mt-6 max-w-xl" variant="meal" />
            </div>

            <div className="relative overflow-hidden rounded-[28px] border border-zinc-200/70 bg-white/85 p-6 shadow-sm soft-card temple-panel">
              <div
                className="absolute inset-0 opacity-90"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0.95) 100%), url("/hero.svg") center/cover no-repeat',
                }}
              />
              <div
                className="absolute -right-10 -top-12 h-36 w-36 opacity-12"
                style={{ background: 'url("/dharma-wheel.svg") center/contain no-repeat' }}
              />
              <div
                className="absolute -right-8 -bottom-10 h-32 w-32 opacity-18"
                style={{ background: 'url("/lotus.svg") center/contain no-repeat' }}
              />
              <div className="relative z-10">
                <div className="text-xs font-semibold text-zinc-500">今日供斋</div>
                <div className="mt-2 text-lg font-semibold serif-title text-zinc-900">清淡 · 省简 · 随缘</div>
                <p className="mt-2 text-sm text-zinc-700">
                  以清净为本，随缘供斋。愿您安静到访，心与味同静。
                </p>

                <div className="mt-6 grid gap-3 text-sm text-zinc-700">
                  <div className="flex items-center justify-between">
                    <span>供斋方式</span>
                    <span className="text-zinc-500">随缘供养</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>到访礼仪</span>
                    <span className="text-zinc-500">安静整洁</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>到访建议</span>
                    <span className="text-zinc-500">提前一日</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="section pt-0 fade-in">
        <Container>
          <div className="mb-10 ink-divider" />

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
            <div className="space-y-10">
              {categories.map((cat, idx) => (
                <section
                  key={cat}
                  className={`grid gap-4 lg:grid-cols-[220px_1fr] ${idx === 0 ? "rise-in stagger-1" : "rise-in"}`}
                >
                  <div className="pt-2">
                    <div className="text-xs font-semibold text-zinc-500">供斋</div>
                    <h2 className="mt-2 text-2xl font-semibold serif-title text-zinc-900">
                      {CATEGORY_LABEL[cat] || "其他"}
                    </h2>
                    <p className="mt-2 text-sm text-zinc-600">{CATEGORY_NOTE[cat] || "当日随缘供斋。"}</p>
                    <div className="mt-3 text-xs text-zinc-400">当日随缘</div>
                  </div>

                  <div className="overflow-hidden rounded-3xl border border-zinc-200/70 bg-white/80 menu-list">
                    <div className="divide-y divide-zinc-200/70">
                      {grouped[cat].map((it) => {
                        const img = normalizeUrl(it.image_url);
                        const imageSrc = img || "/dish-placeholder.svg";
                        const unit = Number(it.price_cents ?? 0);

                        return (
                          <div key={it.id} className="flex items-center gap-4 px-5 py-4 menu-row">
                            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50">
                              <Image
                                src={imageSrc}
                                alt={it.name}
                                fill
                                className={img ? "object-cover" : "object-contain p-3 opacity-80"}
                                sizes="56px"
                                unoptimized
                              />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-semibold text-zinc-900">{it.name}</div>
                              {it.description ? (
                                <div className="mt-1 line-clamp-1 text-xs text-zinc-500">
                                  {it.description}
                                </div>
                              ) : (
                                <div className="mt-1 text-xs text-zinc-400">当日随缘</div>
                              )}
                            </div>

                            <div className="text-sm font-semibold text-zinc-900">
                              {formatPrice(it.price_cents)}
                            </div>

                            {it.price_cents !== null ? (
                              <AddToCartButton id={it.id} name={it.name} priceCents={unit} />
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </section>
              ))}
            </div>
          )}

          <div className="mt-12 rounded-3xl border border-zinc-200/70 bg-white/80 p-6 text-sm text-zinc-700">
            轻声交流，缓慢用斋。若需改期或退款，请联系管理员协助。
          </div>

          <div className="mt-10">
            <RitualScroll />
          </div>
        </Container>
      </section>

      <BookingDock />
      <Footer />
    </main>
  );
}
