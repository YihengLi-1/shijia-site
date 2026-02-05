"use client";

import { useMemo, useState } from "react";
import { OFFERINGS } from "@/lib/offerings";

type Stage = "pre" | "post";

const STAGE_META: Record<Stage, { title: string; hint: string }> = {
  pre: { title: "斋前 · 供养偈", hint: "合掌静心 · 轻声诵念" },
  post: { title: "斋后 · 结斋偈", hint: "回向众生 · 安住其心" },
};

export default function RitualScroll({ className = "" }: { className?: string }) {
  const [stage, setStage] = useState<Stage>("pre");
  const [expandPre, setExpandPre] = useState(false);
  const [expandPost, setExpandPost] = useState(false);

  const isPre = stage === "pre";
  const pre = OFFERINGS.pre;
  const post = OFFERINGS.post;
  const data = useMemo(() => (isPre ? pre : post), [isPre, pre, post]);
  const expanded = isPre ? expandPre : expandPost;
  const toggleExpand = () => {
    if (isPre) {
      setExpandPre((v) => !v);
    } else {
      setExpandPost((v) => !v);
    }
  };

  return (
    <section
      className={`relative overflow-hidden rounded-[36px] border border-zinc-200/70 bg-white/85 p-8 shadow-sm soft-card sutra-panel sutra-block scroll-panel ${className}`}
    >
      <div className="scroll-edge scroll-edge-top" aria-hidden="true" />
      <div className="scroll-edge scroll-edge-bottom" aria-hidden="true" />
      <div className="scroll-seam" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -right-10 -top-12 h-24 w-24 opacity-20"
        style={{ background: 'url("/lotus.svg") center/contain no-repeat' }}
      />
      <div
        className="pointer-events-none absolute bottom-6 right-10 h-28 w-28 opacity-20"
        style={{ background: 'url("/enso.svg") center/contain no-repeat' }}
      />
      <div className="flex items-center justify-between gap-4">
        <div className="text-xs font-semibold text-zinc-500">供养仪轨</div>
        <div className="inline-flex rounded-full border border-zinc-200 bg-white/80 p-1 text-xs">
          <button
            type="button"
            onClick={() => setStage("pre")}
            aria-pressed={isPre}
            className={`stage-toggle rounded-full px-3 py-1 transition pressable focus-ring ${
              isPre ? "temple-cta" : "text-zinc-600 hover:text-zinc-800"
            }`}
          >
            斋前
          </button>
          <button
            type="button"
            onClick={() => setStage("post")}
            aria-pressed={!isPre}
            className={`stage-toggle rounded-full px-3 py-1 transition pressable focus-ring ${
              !isPre ? "temple-cta" : "text-zinc-600 hover:text-zinc-800"
            }`}
          >
            斋后
          </button>
        </div>
      </div>

      <div key={stage} className="mt-6 soft-rise stage-panel">
        <div className="text-sm font-semibold text-zinc-900">{STAGE_META[stage].title}</div>
        <div className="mt-1 text-xs text-zinc-500">{STAGE_META[stage].hint}</div>
        {!isPre && post.mantra ? (
          <div className="mt-2 text-xs text-zinc-600">{post.mantra}</div>
        ) : null}
        <div className="mt-3 border-l-2 border-stone-200 pl-4 text-sm leading-7 text-zinc-700">
          <div className={expanded ? "" : "line-clamp-3"}>{data.text}</div>
        </div>
        <button
          type="button"
          onClick={toggleExpand}
          className="mt-2 text-xs font-semibold text-zinc-500 hover:text-zinc-700"
        >
          {expanded ? "收起" : "展开"}
        </button>

        {isPre ? (
          <>
            <div className="mt-4 grid gap-3 text-xs text-zinc-700">
              <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3">
                <span className="font-semibold text-zinc-900">早餐：</span>
                {pre.breakfast}
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3">
                <span className="font-semibold text-zinc-900">午餐：</span>
                {pre.lunch}
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-xs text-zinc-600">
              <div className="text-[11px] font-semibold text-zinc-500">斋前简要</div>
              <div className="mt-2 space-y-1 leading-6">
                {pre.ritual.map((line) => (
                  <div key={line}>• {line}</div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="mt-4 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-xs text-zinc-700">
            <span className="font-semibold text-zinc-900">起立：</span>
            {post.stand}
          </div>
        )}
      </div>
    </section>
  );
}
