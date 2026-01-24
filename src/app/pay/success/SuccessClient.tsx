"use client";

import { useEffect, useMemo, useState } from "react";

type ConfirmResp =
  | { ok: true; status: "paid"; emailed?: boolean; emailResult?: any }
  | { ok: true; status: "pending"; [k: string]: any }
  | { ok: false; error: string; detail?: any };

export default function SuccessClient() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ConfirmResp | null>(null);
  const [err, setErr] = useState<string>("");

  const params = useMemo(() => {
    const sp = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
    const orderId = sp.get("orderId") || sp.get("orderid") || "";
    const sessionId = sp.get("session_id") || sp.get("sessionId") || "";
    return { orderId, sessionId };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setErr("");

      if (!params.orderId) {
        setErr("missing orderId");
        setLoading(false);
        return;
      }
      if (!params.sessionId) {
        setErr("missing session_id");
        setLoading(false);
        return;
      }

      try {
        const url = `/api/pay/confirm?orderId=${encodeURIComponent(params.orderId)}&session_id=${encodeURIComponent(
          params.sessionId
        )}`;

        const r = await fetch(url, { method: "GET", cache: "no-store" });
        const j = (await r.json()) as ConfirmResp;

        if (cancelled) return;
        setData(j);
      } catch (e: any) {
        if (cancelled) return;
        setErr(String(e?.message ?? e));
      } finally {
        if (cancelled) return;
        setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [params.orderId, params.sessionId]);

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-semibold">支付结果</h1>

      <div className="mt-4 text-sm text-gray-600 break-all">
        <div>orderId: {params.orderId || "-"}</div>
        <div>session_id: {params.sessionId || "-"}</div>
      </div>

      <div className="mt-8">
        {loading ? (
          <div className="rounded-lg border p-4">查询中…</div>
        ) : err ? (
          <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
            状态获取失败：{err}
          </div>
        ) : !data ? (
          <div className="rounded-lg border p-4">无数据</div>
        ) : data.ok && data.status === "paid" ? (
          <div className="rounded-lg border border-green-300 bg-green-50 p-4 text-green-800">
            <div className="font-medium">支付成功 ✅</div>
            <div className="mt-2 text-sm text-green-900/80">
              邮件发送：{String((data as any).emailed ?? false)}
            </div>
          </div>
        ) : data.ok && data.status === "pending" ? (
          <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-yellow-800">
            <div className="font-medium">支付尚未确认（pending）</div>
            <div className="mt-2 text-xs text-yellow-900/80 break-all">
              {JSON.stringify(data, null, 2)}
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
            {JSON.stringify(data)}
          </div>
        )}
      </div>

      <div className="mt-10 text-sm text-gray-600">
        如需重试支付，请返回支付页重新发起。
      </div>
    </div>
  );
}