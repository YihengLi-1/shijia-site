"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import { SITE } from "@/lib/site";
import ScriptureQuote from "@/components/ScriptureQuote";
import RitualPanel from "@/components/RitualPanel";

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
  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [booking, setBooking] = useState<any | null>(null);
  const [computedTotal, setComputedTotal] = useState<number | null>(null);

  const statusLabel = useMemo(() => {
    const map: Record<OrderStatus, string> = {
      pending: "尚在确认",
      paid: "已圆满",
      cancelled: "已取消",
      expired: "已过期",
      unknown: "未确认",
    };
    return map[status] || "未确认";
  }, [status]);

  useEffect(() => {
    if (!orderId) {
      setErr("未找到供斋记录，请从供斋页面进入。");
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

        if (st === "paid") {
          const qs = sid
            ? `?orderId=${encodeURIComponent(orderId)}&session_id=${encodeURIComponent(sid)}`
            : `?orderId=${encodeURIComponent(orderId)}`;
          window.location.replace(`/pay/success${qs}`);
          return;
        }

        if (st !== "pending") {
          setErr("当前供斋记录不可支付，请联系管理员。");
          return;
        }
      } catch {
        if (cancelled) return;
        setErr("暂时无法读取供斋记录，请稍后再试或联系管理员。");
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
        setErr(status === "paid" ? "供斋已确认，无需再次操作。" : "当前供斋记录不可继续，请联系管理员。");
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
      setErr("跳转失败，请稍后再试或联系管理员。");
      return;
    }

      const url = String(d?.url || "");
      if (!url) {
        setErr("确认入口生成失败，请稍后再试或联系管理员。");
        return;
      }

      window.location.href = url;
    } catch {
      setErr("请求异常，请稍后再试。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute -top-8 right-8 h-40 w-40 rounded-full blur-3xl opacity-35"
          style={{ background: "radial-gradient(circle, #efe7da 0%, transparent 60%)" }}
        />
        <div
          className="pointer-events-none absolute bottom-10 left-6 h-48 w-48 rounded-full blur-3xl opacity-35"
          style={{ background: "radial-gradient(circle, #f2eadc 0%, transparent 60%)" }}
        />
        <div className="pointer-events-none absolute inset-0 lotus-pattern opacity-[0.12]" />

        <Container className="relative z-10 py-16 fade-in">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200/70 bg-white/70 px-4 py-1 text-xs font-medium text-zinc-600">
            供斋确认
          </div>

          <h1 className="mt-5 text-3xl font-semibold tracking-tight serif-title">确认供斋</h1>
          <p className="mt-2 text-sm text-zinc-600">
            确认后会收到一条提示；若未收到，请先查看垃圾邮箱。
          </p>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-3xl border border-zinc-200/70 bg-white/85 p-6 shadow-sm soft-card">
              <div className="text-xs font-semibold text-zinc-500">供斋信息</div>
              <div className="mt-4 space-y-3 text-sm text-zinc-700">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">参考号</span>
                  <span className="font-mono text-zinc-800">{orderId || "-"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">金额</span>
                  <span className="text-zinc-800">{amountText || "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">进度</span>
                  <span className="text-zinc-800">{statusLabel}</span>
                </div>
              </div>

              {computedTotal !== null && order?.amount_cents && computedTotal !== order.amount_cents ? (
                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  对账提示：供斋金额与明细小计不一致
                </div>
              ) : null}

              <div className="mt-4 text-xs text-zinc-500">
                供斋确认后，我们会为你保留到访信息。
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-200/70 bg-white/85 p-6 shadow-sm soft-card">
              {loading ? (
                <div className="text-sm text-zinc-700">正在读取供斋信息…</div>
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
                      href="/visit"
                      className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold hover:border-zinc-400"
                    >
                      联系与到访
                    </a>
                  </div>
                </div>
              ) : status === "pending" ? (
                <>
                  <div className="text-sm font-semibold text-zinc-900">正在完成供斋</div>
                  <p className="mt-2 text-sm text-zinc-600">点击按钮继续完成供斋。</p>
                  <button
                    onClick={startCheckout}
                    className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white hover:bg-zinc-800 cta-glow pressable focus-ring cta-shimmer"
                  >
                    继续完成
                  </button>
                  <div className="mt-3 text-xs text-zinc-500">完成后会回到确认页。</div>
                </>
              ) : (
                <div className="text-sm text-zinc-700">
                  当前进度：<span className="font-mono">{statusLabel}</span>
                </div>
              )}
            </div>
          </div>

          {(items.length > 0 || booking) ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {items.length > 0 ? (
                <div className="rounded-3xl border border-zinc-200/70 bg-white/85 p-6 shadow-sm soft-card">
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
                <div className="rounded-3xl border border-zinc-200/70 bg-white/85 p-6 shadow-sm soft-card">
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
            </div>
          ) : null}

          <div className="mt-8 grid gap-4 lg:grid-cols-[0.6fr_0.4fr]">
            <RitualPanel stage="pre" compact className="ambient-glow" />
            <ScriptureQuote className="h-full" compact variant="general" />
          </div>

          <div className="mt-6 text-xs text-zinc-500">
            联系：{SITE.contact} · {SITE.address}
          </div>
        </Container>
      </div>
      <Footer />
    </>
  );
}
