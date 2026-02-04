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

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [people, setPeople] = useState(2);
  const [date, setDate] = useState(todayISO);
  const [time, setTime] = useState("12:00");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = useMemo(() => {
    return (
      name.trim() &&
      phone.trim() &&
      people > 0 &&
      date &&
      time &&
      cartCount > 0 &&
      !submitting
    );
  }, [name, phone, people, date, time, cartCount, submitting]);

  async function onSubmit() {
    setError("");
    const cartItems = getCart();
    if (!cartItems.length) {
      setError("请先选择要供养的餐食。");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        people,
        date,
        time,
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
        setError("提交未成功，请稍后再试或联系管理员。");
        setSubmitting(false);
        return;
      }

      const orderId = data?.orderId;
      if (orderId) {
        router.push(`/pay?orderId=${encodeURIComponent(orderId)}`);
        return;
      }

      setError("提交未成功，请稍后再试或联系管理员。");
      setSubmitting(false);
    } catch {
      setError("提交未成功，请稍后再试或联系管理员。");
      setSubmitting(false);
    }
  }

  if (cartCount <= 0) return null;

  return (
    <>
      <div className="sticky bottom-4 z-30 mx-auto flex w-full max-w-6xl px-6">
        <div className="flex w-full items-center justify-between gap-4 rounded-3xl border border-zinc-200/70 bg-white/90 px-6 py-4 shadow-sm backdrop-blur soft-card">
            <div className="text-sm text-zinc-700">
              已选供斋 <span className="font-semibold">{cartCount}</span> 份 · 随缘小计{" "}
              <span className="font-semibold">{formatTotal(cartTotal)}</span>
            </div>
            <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => cart.clearCart()}
              className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold hover:border-zinc-400 pressable"
            >
              清空
            </button>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 pressable btn-glow cta-glow focus-ring"
            >
              确认供斋
            </button>
          </div>
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 fade-in">
          <div
            className="absolute inset-0 bg-black/25 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 mx-auto w-full max-w-3xl px-6 pb-8">
            <div className="rounded-[32px] border border-zinc-200/70 bg-white/95 p-6 shadow-lg soft-rise">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold text-zinc-500">供斋确认</div>
                  <div className="mt-1 text-xl font-semibold serif-title text-zinc-900">
                    安静确认，即可圆满供斋
                  </div>
                  <div className="mt-1 text-xs text-zinc-500">
                    确认后将进入支付，完成后会发送确认信息。
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full border border-zinc-300 bg-white px-3 py-1 text-xs font-semibold hover:border-zinc-400 pressable"
                >
                  收起
                </button>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <input
                  className="rounded-2xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-zinc-400"
                  placeholder="姓名 / 法名"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <input
                  className="rounded-2xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-zinc-400"
                  placeholder="电话 / 微信"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <input
                  type="date"
                  className="rounded-2xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-zinc-400"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
                <input
                  type="time"
                  className="rounded-2xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-zinc-400"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
                <input
                  type="number"
                  min={1}
                  max={50}
                  className="rounded-2xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-zinc-400 md:col-span-2"
                  value={people}
                  onChange={(e) => setPeople(Number(e.target.value))}
                />
              </div>

              <div className="mt-4 text-[11px] text-zinc-500">
                请核对到访信息，供斋与预约将一并完成。
              </div>

              {error ? (
                <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <div className="mt-4 text-xs text-zinc-500">
                愿此供斋，回向一切众生。
              </div>

              <button
                onClick={onSubmit}
                disabled={!canSubmit}
                className="mt-5 w-full rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 pressable btn-glow"
              >
                {submitting ? "提交中..." : "确认供斋"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
