"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Footer from "@/components/Footer";
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
      } catch (e: any) {
        if (!cancelled) {
          setStatus("error");
          setError(String(e?.message ?? e));
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
        className="pointer-events-none absolute -top-8 right-8 h-40 w-40 rounded-full blur-3xl float-slow"
        style={{ background: "radial-gradient(circle, #efe7da 0%, transparent 60%)" }}
      />
      <div
        className="pointer-events-none absolute bottom-8 left-6 h-48 w-48 rounded-full blur-3xl float-slower"
        style={{ background: "radial-gradient(circle, #f2eadc 0%, transparent 60%)" }}
      />
      <div className="pointer-events-none absolute inset-0 lotus-pattern opacity-20" />

      <div className="relative z-10 mx-auto max-w-3xl px-6 py-14">
      <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200/70 bg-white/70 px-4 py-1 text-xs font-medium text-zinc-600">
        随喜护持
      </div>
      <h1 className="mt-5 text-3xl font-semibold tracking-tight serif-title">感谢护持</h1>
      <p className="mt-2 text-sm text-zinc-600">
        随喜功德，回向一切众生。若需退款，请联系管理员人工处理。
      </p>

      <div className="mt-6 rounded-3xl border border-zinc-200/70 bg-white/80 p-6 shadow-sm">
        {status === "pending" ? (
          <div className="text-sm text-zinc-700">正在确认随喜状态…</div>
        ) : status === "paid" ? (
          <div className="text-sm text-zinc-700">已确认完成随喜护持。</div>
        ) : (
          <div className="text-sm text-red-700">暂未确认成功，请稍后刷新或联系管理员。</div>
        )}
        <div className="mt-3 text-xs text-zinc-500">愿此功德，回向一切众生。</div>
      </div>

      <div className="mt-4 rounded-3xl border border-zinc-200/70 bg-white/80 p-6 shadow-sm">
        <div className="text-xs font-semibold text-zinc-500">随喜编号</div>
        <div className="mt-2 font-mono text-sm text-zinc-800">{donationId ? maskId(donationId, 8, 6) : "-"}</div>
        <div className="mt-2 text-xs text-zinc-500">请保存此编号，便于人工核对与退款。</div>
      </div>

      <ScriptureQuote className="mt-6" compact />

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/"
          className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium hover:border-zinc-400"
        >
          返回首页
        </Link>
        <Link
          href="/donation"
          className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
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
