"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type Order = {
  id: string;
  status: string;
  booking_id?: string | null;
  amount_cents?: number | null;
  currency?: string | null;
  paid_at?: string | null;
  stripe_session_id?: string | null;
};

export default function SuccessClient() {
  const sp = useSearchParams();
  const orderId = useMemo(() => (sp.get("orderId") || "").trim(), [sp]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    let alive = true;

    async function run() {
      try {
        setLoading(true);
        setErr("");
        setOrder(null);

        if (!orderId) {
          setErr("缺少 orderId（链接不完整）");
          return;
        }

        const r = await fetch(`/api/order/${encodeURIComponent(orderId)}`, { cache: "no-store" });
        const j = await r.json();

        if (!alive) return;

        if (!r.ok || !j?.ok) {
          setErr(j?.error || "订单查询失败");
          return;
        }

        setOrder(j.order);
      } catch (e: any) {
        if (!alive) return;
        setErr(String(e?.message ?? e));
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    run();
    return () => {
      alive = false;
    };
  }, [orderId]);

  if (loading) {
    return <div className="mx-auto max-w-2xl px-6 py-16">正在确认支付状态…</div>;
  }

  if (err) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-2xl font-semibold">状态获取失败</h1>
        <p className="mt-3 text-sm text-gray-600">{err}</p>
        <p className="mt-6 text-sm text-gray-600">请返回预约页重新进入支付流程，或联系管理员。</p>
      </div>
    );
  }

  const paid = String(order?.status || "").toLowerCase() === "paid";

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-semibold">{paid ? "支付成功 ✅" : "支付处理中 ⏳"}</h1>

      <div className="mt-6 rounded-xl border p-4 text-sm">
        <div className="flex justify-between gap-4">
          <span className="text-gray-600">订单号</span>
          <span className="font-mono">{order?.id}</span>
        </div>
        <div className="mt-2 flex justify-between gap-4">
          <span className="text-gray-600">状态</span>
          <span>{order?.status}</span>
        </div>
        <div className="mt-2 flex justify-between gap-4">
          <span className="text-gray-600">预约号</span>
          <span>{order?.booking_id || "-"}</span>
        </div>
      </div>

      {!paid && (
        <p className="mt-6 text-sm text-gray-600">
          Stripe 回调可能延迟几秒～几十秒。请稍后刷新本页，直到显示“支付成功”。
        </p>
      )}
    </div>
  );
}