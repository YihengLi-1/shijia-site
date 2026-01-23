"use client";

import Header from "@/components/Header";
import Container from "@/components/Container";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function PayPage() {
  const sp = useSearchParams();
  const router = useRouter();

  const bookingId = sp.get("bookingId") || "";
  const orderIdFromUrl = sp.get("orderId") || "";

  const [orderId, setOrderId] = useState(orderIdFromUrl);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>("");

  const canPay = useMemo(() => Boolean(orderId && orderId.length > 10), [orderId]);

  async function createOrderOnce() {
    // 已经有 orderId 就不生成
    if (orderId) return;

    setErr("");
    setCreatingOrder(true);

    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: bookingId || undefined,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.detail || data?.error || "create_order_failed");
      }

      const newOrderId = String(data?.orderId || "");
      if (!newOrderId) throw new Error("create_order_missing_orderId");

      setOrderId(newOrderId);
    } catch (e: any) {
      setErr(String(e?.message || e || "create_order_failed"));
    } finally {
      setCreatingOrder(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (cancelled) return;
      await createOrderOnce();
    })();

    return () => {
      cancelled = true;
    };
    // 只要 bookingId 变化就重新生成（新预约）
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  async function goStripe() {
    setErr("");
    if (!canPay) {
      setErr("orderId 还没生成成功（先重试生成订单）");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data?.detail || data?.error || "checkout_failed");
        return;
      }

      const url = data?.url as string | undefined;
      if (!url) {
        setErr("checkout_no_url");
        return;
      }

      window.location.href = url;
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-pink-200/60 text-zinc-900">
      <Header />

      <section className="py-16">
        <Container>
          <div className="max-w-3xl">
            <h1 className="text-4xl font-black tracking-tight">支付</h1>
            <p className="mt-3 text-zinc-700">
              系统会先自动生成订单，然后用订单去拉起 Stripe Checkout（测试模式）。
            </p>

            <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-zinc-200">
              <div className="grid gap-6">
                <div>
                  <div className="text-sm text-zinc-600">bookingId（来自预约）</div>
                  <div className="mt-2 break-all rounded-2xl bg-zinc-50 px-4 py-3 font-mono text-sm ring-1 ring-zinc-200">
                    {bookingId || "（无）"}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-zinc-600">orderId（系统生成）</div>
                  <div className="mt-2 break-all rounded-2xl bg-zinc-50 px-4 py-3 font-mono text-sm ring-1 ring-zinc-200">
                    {orderId
                      ? orderId
                      : creatingOrder
                      ? "正在生成订单…"
                      : "（未生成：请点击下方“重试生成订单”）"}
                  </div>
                </div>

                {err ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {err}
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => router.push("/book")}
                    className="rounded-full border border-zinc-200 px-5 py-3 text-sm font-semibold hover:bg-zinc-50"
                  >
                    返回预约页
                  </button>

                  {!orderId ? (
                    <button
                      disabled={creatingOrder}
                      onClick={createOrderOnce}
                      className="rounded-full border border-zinc-200 px-5 py-3 text-sm font-semibold hover:bg-zinc-50 disabled:opacity-50"
                    >
                      {creatingOrder ? "生成订单中..." : "重试生成订单"}
                    </button>
                  ) : null}

                  <button
                    disabled={!canPay || creatingOrder || loading}
                    onClick={goStripe}
                    className="rounded-full bg-zinc-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50 hover:bg-zinc-800"
                  >
                    {loading ? "跳转中..." : creatingOrder ? "生成订单中..." : "去 Stripe 支付"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}