"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to console in dev; in prod you'd send to an error service
    console.error("Runtime error:", error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md text-center fade-in">
        <div
          className="w-10 h-10 border border-[var(--red)] flex items-center justify-center mx-auto mb-6"
          style={{ color: "var(--red)", fontSize: "14px", fontFamily: "serif" }}
        >
          叹
        </div>
        <h1 className="text-[1.6rem] font-semibold serif-title text-[var(--ink)] mb-3">
          此处遇到了问题
        </h1>
        <div className="red-rule mb-4 mx-auto" style={{ width: "40px" }} />
        <p className="text-[13.5px] text-[var(--ink-2)] leading-[1.9] mb-2">
          页面暂时出现了一些问题，请稍后再试。
        </p>
        <p className="text-[12px] text-[var(--muted)] mb-8 italic font-display">
          Something went wrong. Please try again in a moment.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={reset}
            className="rounded-full px-5 py-2.5 text-[13px] font-semibold pressable cta-shimmer temple-cta"
          >
            重试 · Try Again
          </button>
          <Link
            href="/"
            className="rounded-full border border-[var(--line)] bg-white/70 px-5 py-2.5 text-[13px] font-medium pressable temple-ghost"
          >
            返回首页 · Home
          </Link>
        </div>
        {error.digest && (
          <p className="mt-6 text-[10.5px] text-[var(--muted)] font-mono opacity-60">
            {error.digest}
          </p>
        )}
      </div>
    </main>
  );
}
