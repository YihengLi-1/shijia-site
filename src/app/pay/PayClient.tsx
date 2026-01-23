"use client";

import { useEffect, useMemo, useState } from "react";

export default function PayClient() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const orderId = useMemo(() => {
    if (typeof window === "undefined") return "";
    const v = new URLSearchParams(window.location.search).get("orderId");
    return (v || "").trim();
  }, []);

  useEffect(() => {
    if (!orderId) setMsg("缺少 orderId（请从订单页面进入支付）");
  }, [orderId]);

  async function startCheckout() {
    if (!orderId) return;
    setLoading(true);
    setMsg(null);

    try {
      const r = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      const data = await r.json().catch(() => ({}));

      if (!r.ok || !data?.ok || !data?.url) {
        throw new Error(data?.error || data?.detail || "checkout_failed");
      }

      window.location.href = data.url; // ✅ 跳转 Stripe Checkout
    } catch (e: any) {
      setMsg(String(e?.message || e));
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-10">
      <h1 className="text-2xl font-semibold">支付</h1>

      <div className="mt-4 text-sm text-gray-600">
        订单号：<span className="font-mono">{orderId || "-"}</span>
      </div>

      {msg ? (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {msg}
        </div>
      ) : null}

      <button
        onClick={startCheckout}
        disabled={loading || !orderId}
        className="mt-6 inline-flex items-center justify-center rounded-xl bg-black px-5 py-3 text-white disabled:opacity-50"
      >
        {loading ? "正在跳转到 Stripe…" : "去支付"}
      </button>

      <div className="mt-4 text-xs text-gray-500">
        完成支付后会自动跳转到成功页，并由系统完成订单确认与发邮件。
      </div>
    </div>
  );
}