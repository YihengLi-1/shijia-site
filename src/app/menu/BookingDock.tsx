"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getCart, useCart } from "@/lib/cartStore";

function formatTotal(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function BookingDock() {
  const router = useRouter();
  const cart = useCart();

  const cartCount = useMemo(() => cart.items.reduce((s, it) => s + it.qty, 0), [cart.items]);
  const cartTotal = useMemo(() => cart.totalCents, [cart.totalCents]);

  const [open, setOpen]         = useState(false);
  const [name, setName]         = useState("");
  const [phone, setPhone]       = useState("");
  const [email, setEmail]       = useState("");
  const [people, setPeople]     = useState(2);
  const [date, setDate]         = useState(todayISO);
  const [time, setTime]         = useState("12:00");
  const [note, setNote]         = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState("");

  const canSubmit = useMemo(() => (
    name.trim() && phone.trim() && people > 0 && date && time && cartCount > 0 && !submitting
  ), [name, phone, people, date, time, cartCount, submitting]);

  async function onSubmit() {
    setError("");
    const cartItems = getCart();
    if (!cartItems.length) {
      setError("请先选择要供养的餐食。 / Please select items first.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        people,
        date,
        time,
        note: note.trim() || undefined,
        items: cartItems.map((it) => ({
          menuItemId: it.menuItemId,
          name: it.name,
          unitPriceCents: it.unitPriceCents,
          qty: it.qty,
        })),
      };

      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError("提交未成功，请稍后再试或联系管理员。 / Submission failed. Please try again.");
        setSubmitting(false);
        return;
      }

      const orderId = data?.orderId;
      if (orderId) {
        router.push(`/pay?orderId=${encodeURIComponent(orderId)}`);
        return;
      }

      setError("提交未成功，请稍后再试或联系管理员。 / Submission failed. Please try again.");
      setSubmitting(false);
    } catch {
      setError("提交未成功，请稍后再试或联系管理员。 / Submission failed. Please try again.");
      setSubmitting(false);
    }
  }

  if (cartCount <= 0) return null;

  return (
    <>
      {/* ── Sticky bar ──────────────────────────── */}
      <div className="sticky bottom-4 z-30 mx-auto w-full max-w-6xl px-5">
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--line)] bg-white/92 px-5 py-3.5 shadow-lg backdrop-blur-md soft-card">
          <div className="text-[13px] text-[var(--ink-2)]">
            <span className="font-semibold text-[var(--ink)]">{cartCount}</span>
            <span className="text-[var(--muted)]"> 份 · </span>
            <span className="font-semibold text-[var(--ink)]">{formatTotal(cartTotal)}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => cart.clearCart()}
              className="rounded-full border border-[var(--line)] bg-white px-3.5 py-1.5 text-[11.5px] font-medium text-[var(--ink-2)] pressable hover:border-[var(--muted)]"
            >
              清空
            </button>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="rounded-full px-5 py-2 text-[13px] font-semibold pressable cta-shimmer temple-cta"
            >
              确认供斋 · Reserve
            </button>
          </div>
        </div>
      </div>

      {/* ── Booking modal ────────────────────────── */}
      {open && (
        <div className="fixed inset-0 z-50 fade-in" role="dialog" aria-modal="true" aria-label="预约供斋">
          <div
            className="absolute inset-0 bg-[var(--ink)]/30 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 flex justify-center px-4 pb-6 md:pb-10">
            <div className="w-full max-w-2xl overflow-y-auto max-h-[85vh] rounded-[24px] border border-[var(--line)] bg-[var(--bg)] p-6 shadow-2xl soft-rise">

              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <div className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                    到访信息 · Reservation Details
                  </div>
                  <h2 className="mt-1.5 text-[18px] font-semibold serif-title text-[var(--ink)]">
                    写下到访信息，我们为您留席
                  </h2>
                  <p className="mt-0.5 text-[11.5px] text-[var(--muted)]">
                    Fill in your details and we'll hold your seat.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="shrink-0 rounded-full border border-[var(--line)] bg-white px-3 py-1 text-[11.5px] font-medium text-[var(--ink-2)] pressable hover:border-[var(--muted)]"
                  aria-label="关闭"
                >
                  ✕
                </button>
              </div>

              {/* Form */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-[var(--muted)] uppercase tracking-[0.08em]">
                    姓名 / 法名 · Name
                  </label>
                  <input
                    className="rounded-xl border border-[var(--line)] bg-white px-4 py-2.5 text-[13.5px] text-[var(--ink)] placeholder-[var(--muted)] outline-none focus:border-[var(--sage)] transition-colors"
                    placeholder="张三 / Dharma name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-[var(--muted)] uppercase tracking-[0.08em]">
                    电话 / 微信 · Phone
                  </label>
                  <input
                    className="rounded-xl border border-[var(--line)] bg-white px-4 py-2.5 text-[13.5px] text-[var(--ink)] placeholder-[var(--muted)] outline-none focus:border-[var(--sage)] transition-colors"
                    placeholder="+1 (xxx) xxx-xxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label className="text-[11px] font-semibold text-[var(--muted)] uppercase tracking-[0.08em]">
                    邮箱 · Email <span className="font-normal normal-case text-[var(--muted)]">（可选 · Optional）</span>
                  </label>
                  <input
                    type="email"
                    className="rounded-xl border border-[var(--line)] bg-white px-4 py-2.5 text-[13.5px] text-[var(--ink)] placeholder-[var(--muted)] outline-none focus:border-[var(--sage)] transition-colors"
                    placeholder="用于接收确认邮件 · For confirmation email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-[var(--muted)] uppercase tracking-[0.08em]">
                    到访日期 · Date
                  </label>
                  <input
                    type="date"
                    className="rounded-xl border border-[var(--line)] bg-white px-4 py-2.5 text-[13.5px] text-[var(--ink)] outline-none focus:border-[var(--sage)] transition-colors"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-[var(--muted)] uppercase tracking-[0.08em]">
                    到访时间 · Time
                  </label>
                  <input
                    type="time"
                    className="rounded-xl border border-[var(--line)] bg-white px-4 py-2.5 text-[13.5px] text-[var(--ink)] outline-none focus:border-[var(--sage)] transition-colors"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label className="text-[11px] font-semibold text-[var(--muted)] uppercase tracking-[0.08em]">
                    到访人数 · Party Size
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    className="rounded-xl border border-[var(--line)] bg-white px-4 py-2.5 text-[13.5px] text-[var(--ink)] outline-none focus:border-[var(--sage)] transition-colors"
                    value={people}
                    onChange={(e) => setPeople(Number(e.target.value))}
                  />
                </div>

                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label className="text-[11px] font-semibold text-[var(--muted)] uppercase tracking-[0.08em]">
                    备注 · Notes <span className="font-normal normal-case text-[var(--muted)]">（可选 · Optional）</span>
                  </label>
                  <textarea
                    rows={2}
                    className="rounded-xl border border-[var(--line)] bg-white px-4 py-2.5 text-[13.5px] text-[var(--ink)] placeholder-[var(--muted)] outline-none focus:border-[var(--sage)] transition-colors resize-none"
                    placeholder="特殊需求或留言 · Special requests or notes"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>
              </div>

              <p className="mt-3 text-[11px] text-[var(--muted)]">
                信息将用于留席与供斋安排，请核对无误。· Information is used for reservation only.
              </p>

              {error && (
                <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[12.5px] text-red-700">
                  {error}
                </div>
              )}

              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-[11px] text-[var(--muted)] serif-title italic">
                  愿此供斋，回向一切众生。
                </p>
                <button
                  onClick={onSubmit}
                  disabled={!canSubmit}
                  className="shrink-0 rounded-full px-6 py-2.5 text-[13.5px] font-semibold disabled:cursor-not-allowed disabled:opacity-50 pressable cta-shimmer temple-cta"
                >
                  {submitting ? "提交中…" : "确认供斋"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
