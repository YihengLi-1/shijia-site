"use client";

import { useState } from "react";

type Item = {
  label: string;
  note: string;
};

export default function ChipReveal({ items, className = "" }: { items: Item[]; className?: string }) {
  const [active, setActive] = useState(0);

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-2 text-xs text-zinc-600">
        {items.map((item, idx) => {
          const isActive = idx === active;
          return (
            <button
              key={item.label}
              type="button"
              aria-pressed={isActive}
              onClick={() => setActive(idx)}
              onMouseEnter={() => setActive(idx)}
              onFocus={() => setActive(idx)}
              className={`feature-chip rounded-full border px-3 py-1 transition focus-ring pressable text-xs font-semibold ${
                isActive
                  ? "border-zinc-900 bg-zinc-900 text-white active"
                  : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      <div key={items[active]?.label} className="mt-3 text-xs text-zinc-500 soft-rise chip-reveal-note">
        {items[active]?.note}
      </div>
    </div>
  );
}
