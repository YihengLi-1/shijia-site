"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Footer from "@/components/Footer";
import ScriptureQuote from "@/components/ScriptureQuote";

type OrderStatus = "pending" | "paid" | "cancelled" | "expired" | "unknown";

type ApiOrder = {
  id?: string;
  status?: string;
  amount_cents?: number;
  currency?: string;
  stripe_session_id?: string | null;
  booking_id?: string | null;
};

type OrderResp =
  | { ok?: boolean; order?: ApiOrder; items?: any[]; booking?: any; computedTotalCents?: number; error?: any; detail?: any }
  | any;

export default function PayClient(props: { orderId?: string }) {
  const sp = useSearchParams();
  const orderId = useMemo(() => {
    const fromProps = String(props?.orderId ?? "").trim();
    if (fromProps) return fromProps;
    return String(sp.get("orderId") || sp.get("orderid") || "").trim();
  }, [props?.orderId, sp]);

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<OrderStatus>("unknown");
  const [amountText, setAmountText] = useState<string>("");
  const [err, setErr] = useState<string>("");
  const [sessionId, setSessionId] = useState<string>("");
  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [booking, setBooking] = useState<any | null>(null);
  const [computedTotal, setComputedTotal] = useState<number | null>(null);

  const statusLabel = useMemo(() => {
    const map: Record<OrderStatus, string> = {
      pending: "等待支付",
      paid: "已完成",
      cancelled: "已取消",
      expired: "已失效",
      unknown: "未知",
    };
    return map[status] || "未知";
  }, [status]);

  useEffect(() => {
    if (!orderId) {
      setErr("未找到订单编号，请从预约页面进入。");
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

        if (cancelled) return;

        // ✅ 关键修复：你的 API 返回在 d.order.status
        const rawStatus = String(d?.order?.status ?? d?.status ?? "unknown").toLowerCase();
        const st = (rawStatus || "unknown") as OrderStatus;
        setStatus(st);
        setOrder(d?.order ?? null);
        setItems(Array.isArray(d?.items) ? d.items : []);
        setBooking(d?.booking ?? null);
        setComputedTotal(
          Number.isFinite(Number(d?.computedTotalCents)) ? Number(d.computedTotalCents) : null
        );
        const cents = Number(d?.order?.amount_cents ?? 0);
        const currency = String(d?.order?.currency ?? "usd").toUpperCase();
        if (Number.isFinite(cents) && cents > 0) {
          setAmountText(`${(cents / 100).toFixed(2)} ${currency}`);
        }
        const sid = String(d?.order?.stripe_session_id ?? "").trim();
        if (sid) setSessionId(sid);

        if (st === "paid") {
          const qs = sid
            ? `?orderId=${encodeURIComponent(orderId)}&session_id=${encodeURIComponent(sid)}`
            : `?orderId=${encodeURIComponent(orderId)}`;
          window.location.replace(`/pay/success${qs}`);
          return;
        }

        if (st !== "pending") {
          setErr("订单当前不可支付，请联系管理员。");
          return;
        }
      } catch (e: any) {
        if (cancelled) return;
        setErr("暂时无法读取订单，请稍后再试或联系管理员。");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  async function startCheckout() {
    if (!orderId) return;

    if (status !== "pending") {
      setErr(status === "paid" ? "订单已完成，无需重复支付。" : "订单当前不可支付，请联系管理员。");
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
        setErr("支付跳转失败，请稍后重试或联系管理员。");
        return;
      }

      const url = String(d?.url || "");
      if (!url) {
        setErr("支付链接生成失败，请稍后重试或联系管理员。");
        return;
      }

      window.location.href = url;
    } catch (e: any) {
      setErr("支付请求异常，请稍后重试。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
    <div className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute -top-8 right-8 h-40 w-40 rounded-full blur-3xl float-slow"
        style={{ background: "radial-gradient(circle, #efe7da 0%, transparent 60%)" }}
      />
      <div
        className="pointer-events-none absolute bottom-10 left-6 h-48 w-48 rounded-full blur-3xl float-slower"
        style={{ background: "radial-gradient(circle, #f2eadc 0%, transparent 60%)" }}
      />
      <div className="pointer-events-none absolute inset-0 lotus-pattern opacity-20" />

      <div className="relative z-10 mx-auto max-w-3xl px-6 py-16">
      <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200/70 bg-white/70 px-4 py-1 text-xs font-medium text-zinc-600">
        供斋支付
      </div>

      <h1 className="mt-5 text-3xl font-semibold tracking-tight serif-title">确认供斋</h1>
      <p className="mt-2 text-sm text-zinc-600">
        支付完成后会发送确认邮件。若未收到，请先查看垃圾邮箱。
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-zinc-200/70 bg-white/80 p-6 shadow-sm">
          <div className="text-xs font-semibold text-zinc-500">供斋参考号</div>
          <div className="mt-2 font-mono text-sm text-zinc-800">{orderId || "-"}</div>

          <div className="mt-5 text-xs font-semibold text-zinc-500">金额</div>
          <div className="mt-2 text-sm text-zinc-800">{amountText || "—"}</div>

          <div className="mt-5 text-xs font-semibold text-zinc-500">状态</div>
          <div className="mt-2 text-sm text-zinc-800">{statusLabel}</div>

          {computedTotal !== null && order?.amount_cents && computedTotal !== order.amount_cents ? (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
              对账提示：订单金额与明细小计不一致
            </div>
          ) : null}

          <div className="mt-4 text-xs text-zinc-500">
            支付成功后，供斋记录会自动关联到访信息。
          </div>
        </div>

        <div className="rounded-3xl border border-zinc-200/70 bg-white/80 p-6 shadow-sm">
          {loading ? (
            <div className="text-sm text-zinc-700">正在加载订单状态…</div>
          ) : err ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {err}
              </div>
              <div className="flex flex-wrap gap-2">
                <a
                  href="/menu"
                  className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold hover:border-zinc-400"
                >
                  回到供斋
                </a>
                <a
                  href="/donation"
                  className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold hover:border-zinc-400"
                >
                  联系管理员
                </a>
              </div>
            </div>
          ) : status === "pending" ? (
            <>
              <div className="text-sm font-semibold text-zinc-900">待确认支付</div>
              <p className="mt-2 text-sm text-zinc-600">
                点击按钮跳转到 Stripe 完成支付。
              </p>
              <button
                onClick={startCheckout}
                className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white hover:bg-zinc-800"
              >
                去支付
              </button>
              <div className="mt-3 text-xs text-zinc-500">
                完成支付后会自动跳转到成功页。
              </div>
            </>
          ) : (
            <div className="text-sm text-zinc-700">
              当前订单状态：<span className="font-mono">{statusLabel}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-zinc-200/70 bg-white/80 p-6 text-sm text-zinc-700 shadow-sm">
        若支付后未能自动跳转，请刷新本页或联系管理员协助核对。
      </div>

      {items.length > 0 ? (
        <div className="mt-6 rounded-3xl border border-zinc-200/70 bg-white/80 p-6 shadow-sm">
          <div className="text-xs font-semibold text-zinc-500">供斋明细</div>
          <div className="mt-4 divide-y">
            {items.map((it: any, idx: number) => (
              <div key={`${it.menu_item_id || idx}`} className="flex items-center justify-between py-3 text-sm">
                <div className="text-zinc-700">{it.item_name || "菜品"}</div>
                <div className="text-zinc-600">
                  {it.qty} × ${(Number(it.unit_price_cents ?? 0) / 100).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {booking ? (
        <div className="mt-6 rounded-3xl border border-zinc-200/70 bg-white/80 p-6 shadow-sm">
          <div className="text-xs font-semibold text-zinc-500">预约信息</div>
          <div className="mt-3 grid gap-2 text-sm text-zinc-700 sm:grid-cols-2">
            <div>姓名：{booking?.name ?? "-"}</div>
            <div>电话：{booking?.phone ?? "-"}</div>
            <div>日期：{booking?.date ?? "-"}</div>
            <div>时间：{booking?.time ?? "-"}</div>
            <div>人数：{booking?.people ?? "-"}</div>
          </div>
        </div>
      ) : null}

      <ScriptureQuote className="mt-6" compact />
      </div>
    </div>
    <Footer />
    </>
  );
}
