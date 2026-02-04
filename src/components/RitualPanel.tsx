"use client";

import { useState } from "react";
import { OFFERINGS } from "@/lib/offerings";

type Stage = "pre" | "post";

type Props = {
  stage: Stage;
  className?: string;
  compact?: boolean;
  showMeals?: boolean;
  showRitual?: boolean;
  showMantra?: boolean;
};

const META: Record<Stage, { label: string; hint: string }> = {
  pre: { label: "斋前", hint: "供养偈 · 合掌静心" },
  post: { label: "斋后", hint: "回向偈 · 结斋安住" },
};

export default function RitualPanel({
  stage,
  className = "",
  compact = false,
  showMeals,
  showRitual,
  showMantra,
}: Props) {
  const data = stage === "pre" ? OFFERINGS.pre : OFFERINGS.post;
  const [expanded, setExpanded] = useState(false);

  const showMealsFinal = showMeals ?? stage === "pre";
  const showRitualFinal = showRitual ?? stage === "pre";
  const showMantraFinal = showMantra ?? stage === "post";

  return (
    <section
      className={`rounded-[28px] border border-zinc-200/70 bg-white/85 p-6 shadow-sm soft-card sutra-block ${className}`}
    >
      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span className="font-semibold">{META[stage].label}</span>
        <span className="tracking-wide">{META[stage].hint}</span>
      </div>

      <div className={`mt-3 ${compact ? "text-lg" : "text-xl"} font-semibold serif-title text-zinc-900`}>
        {data.title}
      </div>

      {showMantraFinal && "mantra" in data && data.mantra ? (
        <div className="mt-2 text-xs text-zinc-600">{data.mantra}</div>
      ) : null}

      <div
        className={`mt-4 border-l-2 border-stone-200 pl-4 ${compact ? "text-sm" : "text-base"} leading-7 text-zinc-700`}
      >
        <div className={expanded ? "" : compact ? "line-clamp-2" : "line-clamp-3"}>{data.text}</div>
      </div>

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-3 text-xs font-semibold text-zinc-500 hover:text-zinc-700 pressable focus-ring"
      >
        {expanded ? "收起" : "展开全文"}
      </button>

      {showMealsFinal ? (
        <div className={`mt-4 grid gap-3 ${compact ? "text-xs" : "text-sm"} text-zinc-700`}>
          <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3">
            <span className="font-semibold text-zinc-900">早餐：</span>
            {OFFERINGS.pre.breakfast}
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3">
            <span className="font-semibold text-zinc-900">午餐：</span>
            {OFFERINGS.pre.lunch}
          </div>
        </div>
      ) : null}

      {showRitualFinal && stage === "pre" && data.ritual?.length ? (
        <div className={`mt-4 rounded-2xl border border-zinc-200 bg-white px-4 py-3 ${compact ? "text-xs" : "text-sm"} text-zinc-700`}>
          <div className="text-[11px] font-semibold text-zinc-500">斋前简要</div>
          <div className="mt-2 space-y-1 leading-6">
            {data.ritual.map((line) => (
              <div key={line}>• {line}</div>
            ))}
          </div>
        </div>
      ) : null}

      {stage === "post" && data.stand ? (
        <div className={`mt-4 rounded-2xl border border-zinc-200 bg-white px-4 py-3 ${compact ? "text-xs" : "text-sm"} text-zinc-700`}>
          <span className="font-semibold text-zinc-900">起立：</span>
          {data.stand}
        </div>
      ) : null}
    </section>
  );
}
