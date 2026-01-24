"use client";

import { useEffect, useMemo, useState } from "react";

type Resp =
  | { ok: true; status: string; emailed?: boolean; emailResult?: any }
  | { ok?: false; error?: string; detail?: any; [k: string]: any };

export default function SuccessClient() {
  const [loading, setLoading] = useState(true);
  const [resp, setResp] = useState<Resp | null>(null);

  const qs = useMemo(() => {
    if (typeof window === "undefined") return new URLSearchParams();
    return new URLSearchParams(window.location.search);
  }, []);

  const orderId = (qs.get("orderId") || "").trim();
  // Stripe 会回 session_id，部分地方你也可能用 sessionId，这里两种都兼容
  const sessionId =
    (qs.get("session_id") || qs.get("sessionId") || "").trim();

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        setLoading(true);

        if (!orderId || !sessionId) {
          setResp({
            ok: false,
            error: "missing_params",
            detail: { orderIdPresent: !!orderId, sessionIdPresent: !!sessionId },
          });
          return;
        }

        // 用 GET，确保不会被 Next 当成页面路由；并强制 no-store
        const url =
          `/api/pay/confirm?orderId=${encodeURIComponent(orderId)}` +
          `&session_id=${encodeURIComponent(sessionId)}`;

        const r = await fetch(url, {
          method: "GET",
          cache: "no-store",
          headers: { accept: "application/json" },
        });

        const ct = r.headers.get("content-type") || "";
        if (!ct.includes("application/json")) {
          const text = await r.text();
          setResp({
            ok: false,
            error: "non_json_response",
            detail: { status: r.status, contentType: ct, bodyHead: text.slice(0, 200) },
          });
          return;
        }

        const j = (await r.json()) as Resp;
        setResp(j);
      } catch (e: any) {
        setResp({ ok: false, error: String(e?.message ?? e) });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [orderId, sessionId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-3xl font-semibold">支付结果</h1>
        <p className="mt-6 text-gray-600">正在确认付款状态…</p>
      </div>
    );
  }

  const ok = (resp as any)?.ok === true;
  const status = ok ? (resp as any).status : null;

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-semibold">支付结果</h1>

      <div className="mt-6 rounded-xl border p-5">
        <div className="text-sm text-gray-600">订单号</div>
        <div className="mt-1 font-mono text-sm break-all">{orderId || "-"}</div>

        <div className="mt-4 text-sm text-gray-600">Session</div>
        <div className="mt-1 font-mono text-sm break-all">{sessionId || "-"}</div>
      </div>

      {ok ? (
        <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-5">
          <div className="text-lg font-semibold text-green-800">支付成功 ✅</div>
          <div className="mt-2 text-green-900">
            状态：<span className="font-mono">{status}</span>
          </div>
          <div className="mt-2 text-green-900">
            邮件发送：<span className="font-mono">{String((resp as any).emailed ?? false)}</span>
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5">
          <div className="text-lg font-semibold text-red-800">状态获取失败</div>
          <div className="mt-2 text-red-900 font-mono text-sm break-all">
            {JSON.stringify(resp, null, 2)}
          </div>
        </div>
      )}

      <p className="mt-10 text-sm text-gray-500">
        如需重试支付，请返回支付页重新发起。
      </p>
    </div>
  );
}