"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  price_cents: number;
  is_available: boolean;
  sort: number;
};

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function categoryLabel(cat: string) {
  const c = (cat || "").toLowerCase();
  if (c === "main") return "主食";
  if (c === "soup") return "汤品";
  if (c === "drink") return "饮品";
  if (c === "dessert") return "甜点";
  return cat || "其他";
}

export default function HomeMenuSection() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/menu", { cache: "no-store" });
        const json = await res.json();
        if (!res.ok || json?.ok === false) {
          throw new Error(json?.detail || json?.error || `http_${res.status}`);
        }
        if (!cancelled) setItems(json.items ?? []);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || "unknown");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const groups = useMemo(() => {
    const m = new Map<string, MenuItem[]>();
    for (const it of items) {
      const key = (it.category || "other").toLowerCase();
      m.set(key, [...(m.get(key) || []), it]);
    }
    return m;
  }, [items]);

  const keys = useMemo(() => {
    const order = ["main", "soup", "drink", "dessert", "other"];
    return Array.from(groups.keys()).sort((a, b) => {
      const ia = order.indexOf(a);
      const ib = order.indexOf(b);
      return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
    });
  }, [groups]);

  return (
    <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-zinc-900">今日素食菜单</div>
          <div className="mt-1 text-sm text-zinc-600">菜单与供应以当日为准。</div>
        </div>
        <Link
          href="/menu"
          className="rounded-full border border-zinc-300 bg-white px-3 py-1 text-sm font-medium hover:border-zinc-400"
        >
          查看完整菜单
        </Link>
      </div>

      {err ? (
        <div className="mt-4 text-sm text-red-600">菜单加载失败：{err}</div>
      ) : items.length === 0 ? (
        <div className="mt-4 text-sm text-zinc-600">当前暂无可展示菜品。</div>
      ) : (
        <div className="mt-4 space-y-5">
          {keys.map((k) => (
            <div key={k}>
              <div className="mb-2 text-sm font-semibold text-zinc-900">
                {categoryLabel(k)}
              </div>
              <div className="rounded-xl border border-zinc-200">
                {groups.get(k)!.map((it, idx) => (
                  <div
                    key={it.id}
                    className={`flex items-center justify-between gap-4 px-4 py-3 ${
                      idx === 0 ? "" : "border-t border-zinc-200"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="font-medium">{it.name}</div>
                      {it.description ? (
                        <div className="mt-0.5 truncate text-sm text-zinc-600">
                          {it.description}
                        </div>
                      ) : null}
                    </div>
                    <div className="shrink-0 font-medium">{formatPrice(it.price_cents)}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}