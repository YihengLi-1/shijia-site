"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Footer from "@/components/Footer";
import { SITE } from "@/lib/site";

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
      <div className="relative z-10 mx-auto max-w-2xl px-6 py-14 fade-in">
      <div className="text-xs font-semibold tracking-[0.18em] text-zinc-500">随喜护持</div>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight serif-title">感谢护持</h1>
      <p className="mt-2 text-sm text-zinc-600">随喜功德，回向一切众生。</p>

      <div className="mt-8 border-l border-zinc-200/70 pl-6">
        <div className="pb-6">
          <div className="text-[11px] font-semibold tracking-[0.22em] text-zinc-500">状态</div>
          <div className="mt-2 text-sm text-zinc-800">
            {status === "pending"
              ? "正在确认随喜进度…"
              : status === "paid"
                ? "随喜已圆满。"
                : `暂未确认完成，请稍后刷新或联系管理员。${error ? `（${error}）` : ""}`}
          </div>
        </div>

        <div className="border-t border-zinc-200/60 py-6">
          <div className="text-[11px] font-semibold tracking-[0.22em] text-zinc-500">随喜编号</div>
          <div className="mt-2 font-mono text-base text-zinc-900">{donationId ? maskId(donationId, 8, 6) : "-"}</div>
          <div className="mt-1 text-xs text-zinc-500">请保存此编号，便于人工核对。</div>
        </div>

        <div className="border-t border-zinc-200/60 py-6">
          <div className="text-[11px] font-semibold tracking-[0.22em] text-zinc-500">联系</div>
          <div className="mt-2 text-sm text-zinc-800">{SITE.contact}</div>
          <div className="mt-1 text-xs text-zinc-500">{SITE.address}</div>
        </div>

        <div className="border-t border-zinc-200/60 pt-6">
          <div className="text-[11px] font-semibold tracking-[0.22em] text-zinc-500">回向偈</div>
          <p className="mt-2 text-sm leading-7 text-zinc-800">
            愿以此功德，庄严佛净土；上报四重恩，下济三途苦。
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
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
