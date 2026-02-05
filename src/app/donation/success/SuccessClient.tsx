"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Footer from "@/components/Footer";
import { SITE } from "@/lib/site";
import ScriptureQuote from "@/components/ScriptureQuote";

export default function SuccessClient() {
  const sp = useSearchParams();
  const donationId = useMemo(() => (sp.get("donationId") || "").trim(), [sp]);
  const sessionId = useMemo(() => (sp.get("session_id") || "").trim(), [sp]);

  const [status, setStatus] = useState<"pending" | "paid" | "error">("pending");
  const [error, setError] = useState<string>("");

  function maskId(id: string, keepStart = 6, keepEnd = 6) {
    const s = (id || "").trim();
    if (!s) return "";
    if (s.length <= keepStart + keepEnd + 3) return s;
    return `${s.slice(0, keepStart)}…${s.slice(-keepEnd)}`;
  }

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!donationId || !sessionId) {
        setStatus("error");
        setError("missing_donationId_or_session");
        return;
      }

      try {
        const r = await fetch(
          `/donation/confirm?donationId=${encodeURIComponent(donationId)}&session_id=${encodeURIComponent(sessionId)}`,
          { cache: "no-store" }
        );
        const j = await r.json().catch(() => ({}));
        if (!r.ok || !j?.ok) throw new Error(j?.error || "confirm_failed");
        if (!cancelled) {
          setStatus(j?.status === "paid" ? "paid" : "pending");
        }
      } catch (err) {
        if (!cancelled) {
          setStatus("error");
          setError(String(err instanceof Error ? err.message : err));
        }
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [donationId, sessionId]);

  return (
    <>
    <div className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute -top-8 right-8 h-40 w-40 rounded-full blur-3xl opacity-35"
        style={{ background: "radial-gradient(circle, #efe7da 0%, transparent 60%)" }}
      />
      <div
        className="pointer-events-none absolute bottom-8 left-6 h-48 w-48 rounded-full blur-3xl opacity-35"
        style={{ background: "radial-gradient(circle, #f2eadc 0%, transparent 60%)" }}
      />
      <div className="pointer-events-none absolute inset-0 lotus-pattern opacity-[0.12]" />

      <div className="relative z-10 mx-auto max-w-3xl px-6 py-14 fade-in">
      <div className="hall-plaque-wrap">
        <div className="hall-plaque">
          <span className="hall-plaque-dot" aria-hidden="true" />
          随喜护持
        </div>
      </div>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight serif-title">感谢护持</h1>
      <p className="mt-2 text-sm text-zinc-600">随喜功德，回向一切众生。</p>

      <div className="mt-6 rounded-[32px] border border-zinc-200/70 bg-white/85 p-7 shadow-sm soft-card temple-panel">
        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="space-y-4">
            <div className="rounded-2xl border border-zinc-200/70 bg-white/80 px-5 py-4 shadow-sm">
              {status === "pending" ? (
                <div className="text-sm text-zinc-700">正在确认随喜进度…</div>
              ) : status === "paid" ? (
                <div className="text-sm text-zinc-700">随喜已圆满。</div>
              ) : (
                <div className="text-sm text-red-700">暂未确认完成，请稍后刷新或联系管理员。</div>
              )}
            </div>

            <div className="rounded-2xl border border-zinc-200/70 bg-white/80 px-5 py-4 shadow-sm">
              <div className="text-xs font-semibold text-zinc-500">随喜编号</div>
              <div className="mt-2 font-mono text-sm text-zinc-800">
                {donationId ? maskId(donationId, 8, 6) : "-"}
              </div>
              <div className="mt-2 text-xs text-zinc-500">请保存此编号，便于人工核对。</div>
            </div>

            <div className="rounded-2xl border border-zinc-200/70 bg-white/80 px-5 py-4 shadow-sm">
              <div className="text-xs font-semibold text-zinc-500">联系</div>
              <div className="mt-2 text-sm text-zinc-700">{SITE.contact}</div>
              <div className="mt-1 text-xs text-zinc-500">{SITE.address}</div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-zinc-200/70 bg-white/80 px-5 py-4 text-sm text-zinc-700 shadow-sm">
              <div className="text-xs font-semibold text-zinc-500">回向偈</div>
              <p className="mt-3 leading-7">
                愿以此功德，庄严佛净土；上报四重恩，下济三途苦。
              </p>
            </div>
            <ScriptureQuote className="mt-0" compact variant="compassion" />
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/"
          className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium temple-ghost"
        >
          返回首页
        </Link>
        <Link
          href="/donation"
          className="rounded-full px-4 py-2 text-sm font-medium temple-cta"
        >
          继续随喜
        </Link>
      </div>
    </div>
    </div>
    <Footer />
    </>
  );
}
