"use client";

import { useMemo, useState } from "react";
import { OFFERINGS } from "@/lib/offerings";

type Props = {
  compact?: boolean;
  defaultTab?: "pre" | "post";
};

export default function OfferingsPanel({ compact = false, defaultTab = "pre" }: Props) {
  const [tab, setTab] = useState<"pre" | "post">(defaultTab);
  const [expanded, setExpanded] = useState(false);

  const ritual = tab === "pre" ? OFFERINGS.pre.ritual : null;

  const content = useMemo(() => {
    return tab === "pre"
      ? {
          ...OFFERINGS.pre,
          showMeals: true,
        }
      : {
          ...OFFERINGS.post,
          showMeals: false,
        };
  }, [tab]);

  return (
    <div className="relative overflow-hidden rounded-[32px] border border-zinc-200/70 bg-white/90 p-6 shadow-sm soft-card sutra-panel sutra-block">
      <div
        className="pointer-events-none absolute -left-6 top-10 h-36 w-36 opacity-40"
        style={{ background: 'url("/enso.svg") center/contain no-repeat' }}
      />
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full border border-rose-200/60 bg-rose-100/30 blur-[1px]" />
      <div
        className="pointer-events-none absolute right-6 top-6 h-10 w-10 opacity-40"
        style={{ background: 'url("/lotus.svg") center/contain no-repeat' }}
      />
      <div
        className="pointer-events-none absolute -left-6 -bottom-6 h-28 w-28 rounded-full blur-2xl opacity-40"
        style={{ background: "radial-gradient(circle, rgba(233,219,197,0.55) 0%, transparent 70%)" }}
      />

      <div className="text-xs font-semibold text-zinc-500">供养说明</div>

      <div className="mt-3 inline-flex rounded-full border border-zinc-200 bg-white/90 p-1 text-xs">
        <button
          type="button"
          onClick={() => {
            setTab("pre");
            setExpanded(false);
          }}
          className={`rounded-full px-3 py-1 transition pressable focus-ring ${
            tab === "pre" ? "bg-zinc-900 text-white" : "text-zinc-600 hover:text-zinc-800"
          }`}
        >
          斋前
        </button>
        <button
          type="button"
          onClick={() => {
            setTab("post");
            setExpanded(false);
          }}
          className={`rounded-full px-3 py-1 transition pressable focus-ring ${
            tab === "post" ? "bg-zinc-900 text-white" : "text-zinc-600 hover:text-zinc-800"
          }`}
        >
          斋后
        </button>
      </div>

      <div className="mt-2 text-[11px] text-zinc-500">
        当前为{content.stage}
      </div>

      <h3 className="mt-3 text-xl font-semibold serif-title text-zinc-900">
        {content.title}
      </h3>

      {"mantra" in content && content.mantra ? (
        <div className={`mt-4 ${compact ? "text-xs" : "text-sm"} text-zinc-600 soft-rise`}>
          {content.mantra}
        </div>
      ) : null}

      <div
        key={`${tab}-${expanded ? "full" : "clip"}`}
        className={`mt-3 soft-rise ${compact ? "text-xs" : "text-sm"} leading-7 text-zinc-700`}
      >
        <div className={expanded ? "" : "line-clamp-4"}>{content.text}</div>
      </div>

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-3 text-xs font-semibold text-zinc-500 hover:text-zinc-700 pressable focus-ring"
      >
        {expanded ? "收起" : "展开"}
      </button>

      {content.showMeals ? (
        <div className={`mt-4 grid gap-3 ${compact ? "text-xs" : "text-sm"} soft-rise`}>
          <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-zinc-700">
            <span className="font-semibold text-zinc-900">早餐：</span>
            {OFFERINGS.pre.breakfast}
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-zinc-700">
            <span className="font-semibold text-zinc-900">午餐：</span>
            {OFFERINGS.pre.lunch}
          </div>
        </div>
      ) : null}

      {ritual && ritual.length ? (
        <div className="mt-4 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-xs text-zinc-600 soft-rise">
          <div className="text-[11px] font-semibold text-zinc-500">斋前仪式（简要）</div>
          <ul className="mt-2 space-y-1 leading-6">
            {ritual.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {!content.showMeals ? (
        <div className="mt-4 grid gap-3 text-xs text-zinc-600 soft-rise">
          <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3">
            <span className="font-semibold text-zinc-900">起立：</span>
            {OFFERINGS.post.stand}
          </div>
        </div>
      ) : null}
    </div>
  );
}
