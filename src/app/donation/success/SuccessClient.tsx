"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  const [dedicateTo, setDedicateTo] = useState("");
  const [dedicated, setDedicated] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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

        {/* ── 随缘回向 Dedication ────────────── */}
        {status === "paid" && (
          <div className="border-t border-zinc-200/60 pt-6">
            <div className="text-[11px] font-semibold tracking-[0.22em] text-zinc-500 mb-3">
              随缘回向 · Dedication of Merit
            </div>
            {!dedicated ? (
              <div>
                <p className="text-[12.5px] text-zinc-600 leading-[1.8] mb-4">
                  愿以此护持功德，回向给——
                </p>
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-[13px] text-zinc-800 placeholder-zinc-400 outline-none focus:border-zinc-400 transition-colors"
                    placeholder="填写回向对象（如：父母、一切众生…）"
                    value={dedicateTo}
                    onChange={(e) => setDedicateTo(e.target.value)}
                    maxLength={40}
                    onKeyDown={(e) => { if (e.key === "Enter" && dedicateTo.trim()) setDedicated(true); }}
                  />
                  <button
                    type="button"
                    onClick={() => setDedicated(true)}
                    className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-[12.5px] font-medium text-zinc-700 hover:bg-zinc-50 transition-colors pressable"
                  >
                    回向
                  </button>
                </div>
                <p className="mt-2 text-[11px] text-zinc-400">可留空，默认回向一切众生 · Leave blank to dedicate to all beings</p>
              </div>
            ) : (
              <div className="rounded-xl border border-[var(--line)] bg-[var(--sage-bg)] px-5 py-4 fade-in">
                <p className="text-[13px] text-zinc-700 leading-[2] serif-title">
                  愿以此功德，
                  <br />
                  回向 <span className="font-semibold text-zinc-900">{dedicateTo.trim() || "一切众生"}</span>，
                  <br />
                  愿共离苦得乐，吉祥安稳。
                </p>
                <p className="mt-3 text-[11px] text-zinc-500 italic">
                  May this merit be dedicated to {dedicateTo.trim() || "all sentient beings"} — may they be free from suffering and find peace.
                </p>
                <button
                  type="button"
                  onClick={() => { setDedicated(false); setTimeout(() => inputRef.current?.focus(), 50); }}
                  className="mt-3 text-[11px] text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  重新填写 · Edit
                </button>
              </div>
            )}
          </div>
        )}
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
