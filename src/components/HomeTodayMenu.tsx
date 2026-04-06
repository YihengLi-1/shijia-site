"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  price_cents: number | null;
};

const CATEGORY_ZH: Record<string, string> = {
  main: "主食", side: "小菜", soup: "汤品",
  dessert: "甜品", drink: "饮品", other: "其他",
};

function formatPrice(cents: number | null) {
  if (cents === null || cents === undefined) return null;
  return `$${(cents / 100).toFixed(2)}`;
}

export default function HomeTodayMenu() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/menu", { cache: "no-store" });
        const json = await res.json().catch(() => null);
        if (!alive) return;
        setItems(json?.items ?? []);
      } catch {
        if (!alive) return;
        setErr(true);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  // Pick one item per category (up to 5 categories) for a representative preview
  const preview = useMemo(() => {
    const ORDER = ["main", "soup", "side", "dessert", "drink", "other"];
    const seen = new Set<string>();
    const picked: MenuItem[] = [];
    // First pass: one per category in order
    for (const cat of ORDER) {
      const item = items.find((it) => (it.category || "other").toLowerCase() === cat);
      if (item && !seen.has(item.id)) {
        picked.push(item);
        seen.add(item.id);
      }
      if (picked.length >= 5) break;
    }
    // Fill remaining slots with items not yet picked
    for (const item of items) {
      if (picked.length >= 5) break;
      if (!seen.has(item.id)) {
        picked.push(item);
        seen.add(item.id);
      }
    }
    return picked;
  }, [items]);

  if (loading) {
    return (
      <div className="flex items-center justify-between mb-2">
        <p className="eyebrow">今日供斋 · Today's Offering</p>
        <span className="text-[11.5px] text-[var(--muted)]">加载中…</span>
      </div>
    );
  }

  if (err || items.length === 0) {
    return (
      <div className="flex items-center justify-between">
        <p className="eyebrow mb-0">今日供斋 · Today's Offering</p>
        <Link
          href="/menu"
          className="rounded-full border border-[var(--line)] bg-white/70 px-4 py-1.5 text-[12px] font-medium pressable temple-ghost"
        >
          查看菜单 →
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <p className="eyebrow mb-1">今日供斋 · Today's Offering</p>
          <p className="text-[12px] text-[var(--muted)]">随时令而变，清淡供养。</p>
        </div>
        <Link
          href="/menu"
          className="rounded-full px-5 py-2 text-[12.5px] font-semibold pressable cta-shimmer temple-cta shrink-0"
        >
          预约供斋 →
        </Link>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {preview.map((it) => {
          const cat = CATEGORY_ZH[(it.category || "other").toLowerCase()] ?? "其他";
          const price = formatPrice(it.price_cents);
          return (
            <Link
              key={it.id}
              href="/menu"
              className="flex flex-col gap-1.5 rounded-2xl border border-[var(--line)] bg-white/80 px-4 py-3.5 soft-card pressable hover:border-[var(--muted)] transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-[13px] font-semibold text-[var(--ink)] leading-snug">{it.name}</span>
                {price && <span className="text-[12px] font-semibold text-[var(--ink-2)] shrink-0">{price}</span>}
              </div>
              <span className="text-[10.5px] text-[var(--muted)] tracking-[0.06em]">{cat}</span>
              {it.description && (
                <span className="text-[11.5px] text-[var(--muted)] leading-[1.6] line-clamp-2">{it.description}</span>
              )}
            </Link>
          );
        })}
        {items.length > 5 && (
          <Link
            href="/menu"
            className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-dashed border-[var(--line)] px-4 py-3.5 text-center pressable hover:border-[var(--muted)] transition-colors"
          >
            <span className="text-[13px] font-medium text-[var(--ink-2)]">+{items.length - 5} 道</span>
            <span className="text-[11px] text-[var(--muted)]">查看全部 →</span>
          </Link>
        )}
      </div>
    </div>
  );
}
