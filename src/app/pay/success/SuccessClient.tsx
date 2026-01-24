"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type ConfirmResp =
  | {
      ok: true;
      status: "paid" | "pending" | "failed" | string;
      emailed?: boolean;
      to?: string | null;
      emailResult?: any;
      reason?: string;
    }
  | {
      ok: false;
      error?: string;
      detail?: string;
    };

function maskId(id: string, keepStart = 6, keepEnd = 6) {
  const s = (id || "").trim();
  if (!s) return "";
  if (s.length <= keepStart + keepEnd + 3) return s;
  return `${s.slice(0, keepStart)}…${s.slice(-keepEnd)}`;
}

export default function SuccessClient() {
  const sp = useSearchParams();

  const orderId = useMemo(() => (sp.get("orderId") || "").trim(), [sp]);
  // Stripe 默认回跳参数名是 session_id
  const sessionId = useMemo(
    () => (sp.get("session_id") || sp.get("sessionId") || "").trim(),
    [sp]
  );

  const [loading, setLoading] = useState(true);
  const [resp, setResp] = useState<ConfirmResp | null>(null);
  const [rawError, setRawError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setRawError(null);

      if (!orderId) {
        setResp({ ok: false, error: "missing_orderId" });
        setLoading(false);
        return;
      }
      if (!sessionId) {
        setResp({ ok: false, error: "missing_sessionId" });
        setLoading(false);
        return;
      }

      try {
        const r = await fetch("/api/pay/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify({ orderId, sessionId }),
        });

        // 关键：先看 content-type，避免把 HTML 当 JSON 解析（你之前那个 <!DOCTYPE 报错就是这个）
        const ct = r.headers.get("content-type") || "";
        if (!ct.includes("application/json")) {
          const text = await r.text();
          throw new Error(`confirm_not_json: ${text.slice(0, 120)}`);
        }

        const j = (await r.json()) as ConfirmResp;
        if (!cancelled) setResp(j);
      } catch (e: any) {
        if (!cancelled) {
          setResp({ ok: false, error: "confirm_failed" });
          setRawError(e?.message || String(e));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [orderId, sessionId]);

  const isOk = resp && (resp as any).ok === true;
  const status = isOk ? (resp as any).status : null;
  const isPaid = isOk && status === "paid";
  const emailed = isOk ? Boolean((resp as any).emailed) : false;

  return (
    <div className="mx-auto max-w-2xl px-6 py-14">
      <h1 className="text-4xl font-semibold tracking-tight">支付结果</h1>

      <div className="mt-6 rounded-2xl border bg-white p-6">
        <div className="text-sm text-gray-500">参考号</div>
        <div className="mt-1 font-mono text-base">{maskId(orderId, 8, 6)}</div>

        {/* 不再展示 sessionId，普通用户看了没意义还容易泄露 */}
      </div>

      <div className="mt-6 rounded-2xl border p-6">
        {loading ? (
          <div>
            <div className="text-lg font-medium">正在确认支付状态…</div>
            <div className="mt-2 text-sm text-gray-600">
              这通常只需要几秒钟。请不要关闭页面。
            </div>
          </div>
        ) : isPaid ? (
          <div>
            <div className="text-lg font-semibold">支付成功 ✅</div>
            <div className="mt-2 text-sm text-gray-700">
              我们已记录您的预约，并将发送确认邮件。
            </div>
            <div className="mt-3 text-sm text-gray-600">
              邮件发送： <span className="font-medium">{emailed ? "已发送" : "未发送"}</span>
              {emailed ? (
                <>
                  {typeof (resp as any).to === "string" && (resp as any).to ? (
                    <span className="ml-2 text-gray-500">({(resp as any).to})</span>
                  ) : null}
                </>
              ) : (
                <div className="mt-2 text-gray-500">
                  若未收到，请先查看垃圾邮箱；仍无请联系管理员（系统会记录付款状态，不会丢）。
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            <div className="text-lg font-semibold">状态获取失败</div>
            <div className="mt-2 text-sm text-gray-700">
              {isOk ? `当前状态：${String(status)}` : `错误：${(resp as any)?.error || "unknown"}`}
            </div>
            {rawError ? (
              <div className="mt-2 rounded-lg bg-gray-50 p-3 font-mono text-xs text-gray-700">
                {rawError}
              </div>
            ) : null}
            <div className="mt-3 text-sm text-gray-500">
              你可以返回支付页重试；如果你已在 Stripe 里看到付款成功，用“确认支付”接口会补写状态并发邮件。
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/"
          className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          返回首页
        </Link>

        {/* 你也可以改成你的预约入口，比如 /book 或 /#book */}
        <Link
          href="/#book"
          className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          继续预约
        </Link>
      </div>
    </div>
  );
}