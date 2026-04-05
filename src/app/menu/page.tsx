// src/app/menu/page.tsx
"use client";

import type { Metadata } from "next";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import Container from "@/components/Container";
import AddToCartButton from "@/components/AddToCartButton";
import Footer from "@/components/Footer";
import ScriptureQuote from "@/components/ScriptureQuote";
import RitualScroll from "@/components/RitualScroll";
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

const CATEGORY_LABEL: Record<string, { zh: string; en: string }> = {
  main:    { zh: "主食",   en: "Main"    },
  side:    { zh: "小菜",   en: "Sides"   },
  soup:    { zh: "汤品",   en: "Soups"   },
  dessert: { zh: "甜品",   en: "Sweets"  },
  drink:   { zh: "饮品",   en: "Drinks"  },
  other:   { zh: "其他",   en: "Other"   },
};

const CATEGORY_NOTE: Record<string, { zh: string; en: string }> = {
  main:    { zh: "当季为主，淡中见味。",   en: "Seasonal ingredients, simply prepared." },
  side:    { zh: "少而恰当，轻而不失。",   en: "Small portions, well balanced." },
  soup:    { zh: "温润入心，安住当下。",   en: "Warming, grounding, present." },
  dessert: { zh: "随缘一口，不求过多。",   en: "A little sweetness, nothing more." },
  drink:   { zh: "清润相伴，慢慢品尝。",   en: "Gentle refreshment to accompany." },
  other:   { zh: "随缘备办。",             en: "As available." },
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
    return () => { alive = false; };
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
    <main className="min-h-screen">
      <Header hideCta />

      {/* ── Page header ──────────────────────────── */}
      <section className="section pb-10 relative overflow-hidden fade-in">
        <Container>
          <div className="max-w-2xl rise-in">
            <div className="hall-plaque-wrap mb-5">
              <div className="hall-plaque">
                <span className="hall-plaque-dot" aria-hidden="true" />
                今日供斋 · Today's Menu
              </div>
            </div>

            <h1 className="text-[clamp(2rem,4.5vw,3rem)] font-semibold tracking-tight serif-title text-[var(--ink)]">
              今日供斋
            </h1>
            <p className="mt-1.5 text-base font-light italic tracking-[0.04em] text-[var(--muted)] font-display">
              Today's Offering
            </p>
            <p className="mt-4 text-[13.5px] text-[var(--ink-2)] leading-[1.8] max-w-lg">
              今日所供随时令而变，清淡有度。愿您在此一餐，心与味同静。
            </p>
            <p className="mt-1.5 text-[12px] text-[var(--muted)] max-w-lg">
              The menu varies with the season — light, simple, and offered with care.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {[
                { zh: "当日随缘", en: "Daily variation" },
                { zh: "当季食材", en: "Seasonal produce" },
                { zh: "提前预约", en: "Reserve ahead" },
              ].map((chip) => (
                <span
                  key={chip.zh}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-white/70 px-3 py-1 text-[11.5px] text-[var(--ink-2)]"
                >
                  {chip.zh}
                  <span className="text-[var(--muted)]">· {chip.en}</span>
                </span>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ── Menu items ────────────────────────────── */}
      <section className="pb-20">
        <Container>
          <div className="mb-8 ink-divider" />

          {loading ? (
            <div className="rounded-2xl border border-[var(--line)] bg-white/80 p-8 text-[var(--muted)] text-[13.5px]">
              正在加载供斋菜单… Loading menu…
            </div>
          ) : loadErr ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 text-[13.5px]">
              供斋信息暂时无法加载，请稍后再试。 · Unable to load menu, please try again.
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-[var(--line)] bg-white/80 p-8 text-[var(--muted)] text-[13.5px]">
              今日供斋尚未更新，请稍后再来。 · Menu not yet updated, please check back soon.
            </div>
          ) : (
            <div className="space-y-12">
              {categories.map((cat, idx) => {
                const labels = CATEGORY_LABEL[cat] || { zh: "其他", en: "Other" };
                const notes  = CATEGORY_NOTE[cat]  || { zh: "当日随缘", en: "As available" };
                return (
                  <section
                    key={cat}
                    className={`grid gap-5 lg:grid-cols-[200px_1fr] ${idx === 0 ? "rise-in stagger-1" : "rise-in"}`}
                  >
                    {/* Category header */}
                    <div className="pt-1 lg:pt-2">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                        供斋
                      </div>
                      <h2 className="mt-2 text-[22px] font-semibold serif-title text-[var(--ink)]">
                        {labels.zh}
                      </h2>
                      <p className="text-[12.5px] font-light italic text-[var(--muted)] font-display mt-0.5">
                        {labels.en}
                      </p>
                      <p className="mt-2 text-[12.5px] text-[var(--muted)] leading-[1.7]">{notes.zh}</p>
                      <p className="mt-1 text-[11px] text-[var(--muted)] opacity-70">{notes.en}</p>
                    </div>

                    {/* Items */}
                    <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white menu-list">
                      <div className="divide-y divide-[var(--line-2)]">
                        {grouped[cat].map((it) => {
                          const img = normalizeUrl(it.image_url);
                          const imageSrc = img || "/dish-placeholder.svg";
                          const unit = Number(it.price_cents ?? 0);

                          return (
                            <div key={it.id} className="flex items-center gap-4 px-5 py-4 menu-row">
                              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-[var(--line-2)] bg-[var(--surface-2)]">
                                <Image
                                  src={imageSrc}
                                  alt={it.name}
                                  fill
                                  className={img ? "object-cover" : "object-contain p-2.5 opacity-60"}
                                  sizes="56px"
                                  unoptimized
                                />
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="truncate text-[13.5px] font-semibold text-[var(--ink)]">
                                  {it.name}
                                </div>
                                {it.description ? (
                                  <div className="mt-0.5 line-clamp-1 text-[11.5px] text-[var(--muted)]">
                                    {it.description}
                                  </div>
                                ) : (
                                  <div className="mt-0.5 text-[11.5px] text-[var(--muted)] opacity-60">
                                    当日随缘
                                  </div>
                                )}
                              </div>

                              <div className="text-[13.5px] font-semibold text-[var(--ink)] shrink-0">
                                {formatPrice(it.price_cents)}
                              </div>

                              {it.price_cents !== null && (
                                <AddToCartButton id={it.id} name={it.name} priceCents={unit} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </section>
                );
              })}
            </div>
          )}

          {/* Notice */}
          <div className="mt-10 rounded-2xl border border-[var(--line)] bg-white/70 px-6 py-5 text-[13px] text-[var(--ink-2)] leading-[1.8]">
            <p>轻声交流，缓慢用斋。若需改期或退款，请联系管理员协助。</p>
            <p className="text-[11.5px] text-[var(--muted)] mt-1">
              Please dine quietly and mindfully. For changes or refunds, contact the admin.
            </p>
          </div>

          <div className="mt-10">
            <ScriptureQuote compact variant="meal" />
          </div>

          <div className="mt-8">
            <RitualScroll />
          </div>
        </Container>
      </section>

      <BookingDock />
      <Footer />
    </main>
  );
}
