"use client";

import { useEffect, useMemo, useState } from "react";

type OrderStatus = "pending" | "paid" | "cancelled" | "expired" | "unknown";

type OrderResp =
  | { ok?: boolean; id?: string; status?: OrderStatus; amount_cents?: number; currency?: string; error?: any }
  | any;

export default function PayClient() {
  const orderId = useMemo(() => {
    if (typeof window === "undefined") return "";
    const sp = new URLSearchParams(window.location.search);
    return (sp.get("orderId") || "").trim();
  }, []);

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<OrderStatus>("unknown");
  const [err, setErr] = useState<string>("");

  // 1) 进来先查订单状态：paid -> 直接跳成功页；pending -> 允许支付；其他 -> 禁止
  useEffect(() => {
    if (!orderId) {
      setErr("missing_orderId");
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setErr("");

        const r = await fetch(`/api/order/${encodeURIComponent(orderId)}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        });

        const d: OrderResp = await r.json().catch(() => ({}));

        const st = String(d?.status || "unknown").toLowerCase() as OrderStatus;

        if (cancelled) return;

        setStatus(st);

        if (st === "paid") {
          // ✅ 已付款：直接跳成功页，避免再走 checkout
          window.location.replace(`/pay/success?orderId=${encodeURIComponent(orderId)}`);
          return;
        }

        if (st !== "pending") {
          setErr(`order_not_payable (${st})`);
          return;
        }
      } catch (e: any) {
        if (cancelled) return;
        setErr(String(e?.message ?? e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  // 2) 点击“去支付”：调用 /api/checkout -> 拿 session url 跳转
  async function startCheckout() {
    if (!orderId) return;
    if (status !== "pending") {
      setErr(status === "paid" ? "already_paid" : `order_not_payable (${status})`);
      return;
    }

    try {
      setLoading(true);
      setErr("");

      const r = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      const d = await r.json().catch(() => ({}));

      if (!r.ok || !d?.ok) {
        setErr(d?.error ? `${d.error}${d.detail ? `: ${d.detail}` : ""}` : "checkout_failed");
        return;
      }

      const url = String(d?.url || "");
      if (!url) {
        setErr("missing_checkout_url");
        return;
      }

      window.location.href = url;
    } catch (e: any) {
      setErr(String(e?.message ?? e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-semibold">支付</h1>

      <div className="mt-3 text-sm text-gray-600">
        订单号：<span className="font-mono">{orderId || "-"}</span>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="rounded-lg border p-4 text-gray-700">Loading...</div>
        ) : err ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{err}</div>
        ) : status === "pending" ? (
          <div className="rounded-lg border p-4 text-gray-800">
            <div className="text-sm text-gray-600">状态：pending</div>
            <button
              onClick={startCheckout}
              className="mt-4 inline-flex items-center justify-center rounded-lg bg-black px-6 py-3 text-white"
            >
              去支付
            </button>
            <div className="mt-3 text-xs text-gray-500">
              完成支付后会自动跳转到成功页，并由系统完成订单确认与发邮件。
            </div>
          </div>
        ) : (
          <div className="rounded-lg border p-4 text-gray-700">
            当前订单状态：<span className="font-mono">{status}</span>
          </div>
        )}
      </div>
    </div>
  );
}