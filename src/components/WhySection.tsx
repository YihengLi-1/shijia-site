"use client";

import { useMemo, useState } from "react";

type Feature = {
  key: "space" | "season" | "support";
  label: string;
  title: string;
  subtitle: string;
  note: string;
  ornament: string;
  accent: string;
};

const FEATURES: Feature[] = [
  {
    key: "space",
    label: "清净空间",
    title: "清净空间",
    subtitle: "静处留白，光影自生",
    note: "留一点空与静，让心慢下来。",
    ornament: "/lotus.svg",
    accent: "rgba(198, 180, 150, 0.5)",
  },
  {
    key: "season",
    label: "当季食材",
    title: "当季食材",
    subtitle: "随时令而变",
    note: "随季节更替，味淡而温。",
    ornament: "/hero.svg",
    accent: "rgba(206, 188, 160, 0.5)",
  },
  {
    key: "support",
    label: "随缘护持",
    title: "随缘护持",
    subtitle: "护持用于香灯与供斋",
    note: "随喜随缘，量力而行。",
    ornament: "/seal-mark.svg",
    accent: "rgba(190, 165, 135, 0.55)",
  },
];

export default function WhySection({ intro }: { intro: string }) {
  const [activeKey, setActiveKey] = useState<Feature["key"]>("space");
  const active = useMemo(
    () => FEATURES.find((item) => item.key === activeKey) || FEATURES[0],
    [activeKey]
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
      <div className="relative overflow-hidden rounded-[36px] border border-zinc-200/70 bg-white/80 p-8 shadow-sm soft-card ambient-glow rise-in">
        <div className="text-xs font-semibold text-zinc-500">此处为何</div>
        <div className="mt-3 text-2xl font-semibold text-zinc-900 serif-title">
          一处供斋之所，也是安住之处
        </div>
        <p className="mt-4 text-sm text-zinc-700 leading-7 max-w-2xl">{intro}</p>
        <div className="mt-6 flex flex-wrap gap-2 text-xs text-zinc-600">
          {FEATURES.map((item) => {
            const isActive = item.key === activeKey;
            return (
              <button
                key={item.key}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActiveKey(item.key)}
                onMouseEnter={() => setActiveKey(item.key)}
                onFocus={() => setActiveKey(item.key)}
                className={`feature-chip rounded-full border px-3 py-1 transition focus-ring pressable text-xs font-semibold ${
                  isActive
                    ? "border-zinc-900 bg-zinc-900 text-white active"
                    : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
                }`}
                data-active={isActive ? "true" : "false"}
              >
                {item.label}
              </button>
            );
          })}
        </div>
        <div key={active.key} className="mt-4 text-xs text-zinc-500 soft-rise">
          {active.note}
        </div>
      </div>

      <div className="space-y-6">
        <div
          key={active.key}
          className="feature-panel overflow-hidden rounded-3xl border border-zinc-200/70 bg-white/80 p-4 shadow-sm soft-card hover-scale rise-in stagger-2 soft-rise"
        >
          <div className="relative h-48 w-full overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-stone-100 via-stone-200/60 to-stone-100" />
            <div
              className="absolute -right-6 -top-8 h-24 w-24 opacity-40"
              style={{ background: `url("${active.ornament}") center/contain no-repeat` }}
            />
            <div className="absolute inset-0 border border-white/60" />
            <div
              className="absolute inset-x-6 bottom-4 h-1 rounded-full"
              style={{ background: `linear-gradient(90deg, transparent, ${active.accent}, transparent)` }}
            />
          </div>
          <div className="mt-4 text-sm font-semibold text-zinc-800">{active.title}</div>
          <div className="mt-1 text-xs text-zinc-500">{active.subtitle}</div>
          <div className="mt-2 text-xs text-zinc-600">{active.note}</div>
        </div>
      </div>
    </div>
  );
}
