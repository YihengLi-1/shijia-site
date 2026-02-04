// src/app/menu/page.tsx
"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import Container from "@/components/Container";
import AddToCartButton from "@/components/AddToCartButton";
import Footer from "@/components/Footer";
import ScriptureQuote from "@/components/ScriptureQuote";
import RitualPanel from "@/components/RitualPanel";
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
      <Header hideCta />

      <section className="section pb-16 relative overflow-hidden fade-in">
        <div className="pointer-events-none absolute inset-0 lotus-pattern opacity-[0.12]" />
        <Container className="relative z-10">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200/70 bg-white/70 px-4 py-1 text-xs font-medium text-zinc-600">
                今日供斋
              </div>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight serif-title">今日供斋</h1>
              <p className="mt-3 text-sm text-zinc-600">
                今日所供随时令而变，清淡有度。愿你在此一餐，心与味同静。
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-zinc-600">
                <span className="rounded-full border border-zinc-200 bg-white px-3 py-1">当日随缘</span>
                <span className="rounded-full border border-zinc-200 bg-white px-3 py-1">当季食材</span>
                <span className="rounded-full border border-zinc-200 bg-white px-3 py-1">需提前预约</span>
              </div>

              <div className="mt-6 text-xs text-zinc-500">
                确认后将为你留席并发送提醒；如需改期，请联系管理员协助。
              </div>

              <ScriptureQuote compact className="mt-6 max-w-xl" variant="meal" />
            </div>

            <RitualPanel stage="pre" compact />
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
                <section key={cat} className={`rise-in ${idx === 0 ? "stagger-1" : idx === 1 ? "stagger-2" : "stagger-3"}`}>
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <div className="text-xs font-semibold text-zinc-500">供斋</div>
                      <h2 className="mt-2 text-2xl font-semibold serif-title text-zinc-900">
                        {CATEGORY_LABEL[cat] || "其他"}
                      </h2>
                      <p className="mt-2 text-sm text-zinc-600">
                        {CATEGORY_NOTE[cat] || "当日随缘供斋。"}
                      </p>
                    </div>
                    <div className="text-xs text-zinc-400">当日随缘</div>
                  </div>

                  <div className="mt-5 overflow-hidden rounded-3xl border border-zinc-200/70 bg-white/80">
                    <div className="divide-y divide-zinc-200/70">
                      {grouped[cat].map((it) => {
                        const img = normalizeUrl(it.image_url);
                        const imageSrc = img || "/dish-placeholder.svg";
                        const unit = Number(it.price_cents ?? 0);

                        return (
                          <div key={it.id} className="flex items-center gap-4 px-5 py-4">
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

          <ScriptureQuote className="mt-8" compact variant="meal" />
        </Container>
      </section>

      <BookingDock />
      <Footer />
    </main>
  );
}
