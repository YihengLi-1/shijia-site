"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { clearCart } from "@/lib/cartStore";
import Footer from "@/components/Footer";
import { SITE } from "@/lib/site";
import ScriptureQuote from "@/components/ScriptureQuote";
import Container from "@/components/Container";
import RitualPanel from "@/components/RitualPanel";

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
  const [detail, setDetail] = useState<{
    order?: any;
    items?: any[];
    booking?: any;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDetail() {
      try {
        const od = await fetch(`/api/order/${encodeURIComponent(orderId)}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        }).then((res) => res.json().catch(() => ({})));
        if (!cancelled) {
          setDetail({ order: od?.order, items: od?.items ?? [], booking: od?.booking ?? null });
        }
      } catch {
        // ignore detail fetch failures
      }
    }

    async function run() {
      setLoading(true);

      if (!orderId) {
        setResp({ ok: false, error: "missing_orderId" });
        setLoading(false);
        return;
      }

      try {
        if (!sessionId) {
          // 没有 session_id 时，改为只读订单状态
          const r = await fetch(`/api/order/${encodeURIComponent(orderId)}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
          });
          const j: any = await r.json().catch(() => ({}));
          const st = String(j?.order?.status || j?.status || "unknown").toLowerCase();
          if (!cancelled) {
            if (st === "paid") {
              setResp({ ok: true, status: "paid", emailed: false });
              setDetail({ order: j?.order, items: j?.items ?? [], booking: j?.booking ?? null });
            } else {
              setResp({ ok: false, error: "missing_sessionId" });
            }
          }
          return;
        }

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

        await loadDetail();
      } catch (e: any) {
        if (!cancelled) {
          setResp({ ok: false, error: "confirm_failed" });
        }
        await loadDetail();
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

  const statusLabel = useMemo(() => {
    if (loading) return "正在确认";
    if (isPaid) return "已圆满";
    if (isOk && typeof status === "string") {
      const map: Record<string, string> = {
        pending: "仍在确认",
        failed: "尚未完成",
        cancelled: "已取消",
        expired: "已过期",
      };
      return map[status] || "尚未确认";
    }
    return "尚未确认";
  }, [loading, isPaid, isOk, status]);

  useEffect(() => {
    if (isPaid) {
      clearCart();
    }
  }, [isPaid]);

  return (
    <>
      <div className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute -top-8 right-10 h-44 w-44 rounded-full blur-3xl opacity-35"
          style={{ background: "radial-gradient(circle, #efe7da 0%, transparent 60%)" }}
        />
        <div
          className="pointer-events-none absolute bottom-12 left-8 h-52 w-52 rounded-full blur-3xl opacity-35"
          style={{ background: "radial-gradient(circle, #f2eadc 0%, transparent 60%)" }}
        />
        <div className="pointer-events-none absolute inset-0 lotus-pattern opacity-[0.12]" />

        <Container className="relative z-10 py-16 fade-in">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200/70 bg-white/70 px-4 py-1 text-xs font-medium text-zinc-600">
            完成
          </div>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight serif-title">供斋已确认</h1>
          <p className="mt-2 text-sm text-zinc-600">我们已记录您的供斋与到访信息，请放心保存本页。</p>

          {!orderId ? (
            <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50/80 p-5 text-sm text-amber-800 shadow-sm">
              未找到供斋编号，请从供斋页面进入。
            </div>
          ) : null}

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[32px] border border-zinc-200/70 bg-white/85 p-8 shadow-sm soft-card hover-scale">
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200/70 bg-white px-3 py-1 text-xs text-zinc-500">
                已记录
              </div>
              <div className="mt-4 text-2xl font-semibold serif-title text-zinc-900">一念已圆满</div>
              <p className="mt-2 text-sm text-zinc-700">
                {loading
                  ? "正在确认供斋进度，请稍候片刻。"
                  : isPaid
                  ? "供斋已确认，我们将发送确认信息。"
                  : "若进度仍未确认，请稍后刷新或联系管理员协助。"}
              </p>
              <div className="mt-4 flex flex-wrap gap-3 text-xs text-zinc-500">
                <span className="rounded-full border border-zinc-200 bg-white px-3 py-1">清净供斋</span>
                <span className="rounded-full border border-zinc-200 bg-white px-3 py-1">随缘护持</span>
                <span className="rounded-full border border-zinc-200 bg-white px-3 py-1">安静到访</span>
              </div>
              {emailed && typeof (resp as any)?.to === "string" && (resp as any).to ? (
                <div className="mt-4 text-xs text-zinc-500">确认信息（邮件）：{(resp as any).to}</div>
              ) : null}
              {!emailed && isPaid ? (
                <div className="mt-3 text-xs text-zinc-500">若未收到邮件，请先查看垃圾邮箱；仍无请联系管理员。</div>
              ) : null}
            </div>

            <div className="rounded-3xl border border-zinc-200/70 bg-white/85 p-6 shadow-sm soft-card hover-scale">
              <div className="text-xs font-semibold text-zinc-500">参考号</div>
              <div className="mt-2 font-mono text-sm text-zinc-800">{maskId(orderId, 8, 6)}</div>
              <div className="mt-4 text-xs text-zinc-500">请保存此编号，便于查询、改期或人工协助。</div>
              <ScriptureQuote className="mt-4" compact variant="compassion" />
            </div>
          </div>

          {detail?.order || detail?.booking ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {detail?.order ? (
                <div className="rounded-3xl border border-zinc-200/70 bg-white/85 p-6 shadow-sm soft-card">
                  <div className="text-xs font-semibold text-zinc-500">供斋记录</div>
                  <div className="mt-3 space-y-2 text-sm text-zinc-700">
                    <div>
                      金额：{(Number(detail.order?.amount_cents ?? 0) / 100).toFixed(2)}{" "}
                      {String(detail.order?.currency ?? "usd").toUpperCase()}
                    </div>
                    <div>情况：{isPaid ? "已圆满" : statusLabel}</div>
                    <div>
                      参考号：<span className="font-mono">{String(detail.order?.id ?? "")}</span>
                    </div>
                  </div>
                </div>
              ) : null}

              {detail?.booking ? (
                <div className="rounded-3xl border border-zinc-200/70 bg-white/85 p-6 shadow-sm soft-card">
                  <div className="text-xs font-semibold text-zinc-500">预约信息</div>
                  <div className="mt-3 space-y-2 text-sm text-zinc-700">
                    <div>姓名：{detail.booking?.name ?? "-"}</div>
                    <div>电话：{detail.booking?.phone ?? "-"}</div>
                    <div>日期：{detail.booking?.date ?? "-"}</div>
                    <div>时间：{detail.booking?.time ?? "-"}</div>
                    <div>人数：{detail.booking?.people ?? "-"}</div>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {detail?.items && detail.items.length > 0 ? (
            <div className="mt-6 rounded-3xl border border-zinc-200/70 bg-white/85 p-6 shadow-sm soft-card">
              <div className="text-xs font-semibold text-zinc-500">供斋明细</div>
              <div className="mt-4 divide-y">
                {detail.items.map((it: any, idx: number) => (
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

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <RitualPanel stage="pre" compact showMeals={false} className="ambient-glow" />
            <RitualPanel stage="post" compact showMeals={false} showRitual={false} className="ambient-glow" />
          </div>

          <div className="mt-6 rounded-3xl border border-zinc-200/70 bg-white/85 p-6 shadow-sm soft-card">
            <div className="text-xs font-semibold text-zinc-500">联系</div>
            <div className="mt-2 text-sm text-zinc-700">{SITE.contact}</div>
            <div className="mt-1 text-xs text-zinc-500">{SITE.address}</div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium hover:border-zinc-400"
            >
              返回首页
            </Link>

            <Link
              href="/visit"
              className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium hover:border-zinc-400"
            >
              到访须知
            </Link>

            <Link
              href="/menu"
              className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 cta-glow pressable focus-ring cta-shimmer"
            >
              继续供斋
            </Link>
          </div>
        </Container>
      </div>
      <Footer />
    </>
  );
}
