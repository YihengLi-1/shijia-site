"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Container from "@/components/Container";
import { getCart, useCart } from "@/lib/cartStore";
import Footer from "@/components/Footer";
import ScriptureQuote from "@/components/ScriptureQuote";
import { SITE } from "@/lib/site";

export default function BookPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(""); // 预留：先存，不发
  const [people, setPeople] = useState(1);

  const [date, setDate] = useState(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });

  const [time, setTime] = useState("12:00"); // HH:mm (24h)
  const [note, setNote] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  const cart = useCart();
  const cartCount = useMemo(() => {
    return cart.items.reduce((s, it) => s + (it.qty || 0), 0);
  }, [cart.items]);
  const cartTotal = useMemo(() => {
    return cart.items.reduce((s, it) => s + it.unitPriceCents * it.qty, 0);
  }, [cart.items]);

  const canSubmit = useMemo(() => {
    // ✅ 必须有菜：购物车为空直接不让提交
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

    // ✅ 再防一层：避免 cartCount 的 memo 不是实时的
    const cartItems = getCart();
    if (!cartItems.length) {
      setError("请先在供斋页选择要供养的餐食。");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        people,
        date, // yyyy-mm-dd
        time, // HH:mm
        note: note.trim() || undefined,

        // ✅ 关键：把购物车 items 一起提交给后端
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
        const raw = String(data?.detail || data?.error || "submit_failed");
        const friendly =
          raw.includes("items_required")
            ? "请先在供斋页选择要供养的餐食。"
            : raw.includes("date") || raw.includes("time")
            ? "请检查日期与时间是否正确。"
            : "提交未成功，请稍后再试或联系管理员。";
        setError(friendly);
        setSubmitting(false);
        return;
      }

      // ✅ 兼容：后端可能回 orderId 或 bookingId
      const orderId = data?.orderId;
      const bookingId = data?.bookingId;

      if (orderId) {
        router.push(`/pay?orderId=${encodeURIComponent(orderId)}`);
        return;
      }

      if (bookingId) {
        router.push(`/pay?bookingId=${encodeURIComponent(bookingId)}`);
        return;
      }

      setError("提交未成功，请稍后再试或联系管理员。");
      setSubmitting(false);
    } catch {
      setError("提交未成功，请稍后再试或联系管理员。");
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen text-zinc-900">
      <Header />
      <section className="section relative overflow-hidden">
        <div
          className="pointer-events-none absolute -top-10 right-6 h-48 w-48 rounded-full blur-3xl float-slow"
          style={{ background: "radial-gradient(circle, #efe7da 0%, transparent 60%)" }}
        />
        <div
          className="pointer-events-none absolute bottom-6 left-8 h-56 w-56 rounded-full blur-3xl float-slower"
          style={{ background: "radial-gradient(circle, #f2eadc 0%, transparent 60%)" }}
        />
        <div className="pointer-events-none absolute inset-0 lotus-pattern opacity-20" />
        <Container className="relative z-10">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200/70 bg-white/70 px-4 py-1 text-xs font-medium text-zinc-600">
                预约到访
              </div>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight serif-title">预约</h1>
              <p className="mt-3 text-sm text-zinc-600">
                请填写到访信息，我们将为您预留座位。
              </p>

              <div className="mt-6 text-xs text-zinc-500">
                为减少步骤，供斋已合并为一条路径。建议从供斋页面完成预约。
              </div>

              <div className="mt-4">
                <Link
                  href="/menu"
                  className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold hover:border-zinc-400"
                >
                  前往供斋页面
                </Link>
              </div>

              <div className="mt-6 rounded-3xl bg-white/80 p-8 shadow-sm ring-1 ring-zinc-200/70 soft-card">
                <div className="space-y-8">
                  <div>
                    <div className="text-xs font-semibold text-zinc-500">预约人信息</div>
                    <div className="mt-4 grid gap-6">
                      <div>
                        <label className="text-sm font-semibold">姓名</label>
                        <input
                          className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:border-zinc-400"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="你的姓名"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-semibold">联系电话</label>
                        <input
                          className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:border-zinc-400"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="电话 / 微信"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-semibold">邮箱（可选，用于确认）</label>
                        <input
                          className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:border-zinc-400"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@example.com"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-zinc-500">到访时间</div>
                    <div className="mt-4 grid gap-6 md:grid-cols-2">
                      <div>
                        <label className="text-sm font-semibold">日期</label>
                        <input
                          type="date"
                          className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:border-zinc-400"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-semibold">人数</label>
                        <input
                          type="number"
                          min={1}
                          max={50}
                          className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:border-zinc-400"
                          value={people}
                          onChange={(e) => setPeople(Number(e.target.value))}
                        />
                      </div>
                    </div>
                    <div className="mt-6">
                      <label className="text-sm font-semibold">时间</label>
                      <input
                        type="time"
                        className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:border-zinc-400"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-zinc-500">备注（可选）</div>
                    <textarea
                      className="mt-4 h-28 w-full resize-none rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:border-zinc-400"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="比如：是否需要更安静的位置等"
                    />
                  </div>

                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700">
                    当前已选供斋：<span className="font-semibold">{cartCount}</span> 份
                    {cartCount === 0 ? "（请先在供斋页选择）" : ""}
                  </div>

                  {error ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {error}
                    </div>
                  ) : null}

                  <button
                    onClick={onSubmit}
                    disabled={!canSubmit}
                    className="w-full rounded-full bg-zinc-900 px-6 py-4 text-sm font-semibold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 cta-glow pressable focus-ring"
                  >
                    {submitting ? "提交中..." : "确认供斋并前往支付"}
                  </button>
                </div>
              </div>
            </div>

            <aside className="rounded-3xl border border-zinc-200/70 bg-white/80 p-6 shadow-sm soft-card">
              <div className="text-sm font-semibold text-zinc-900">供斋明细</div>
              <div className="mt-3 text-sm text-zinc-600">
                已选菜品：<span className="font-semibold text-zinc-900">{cartCount}</span> 份
              </div>
              <div className="mt-2 text-sm text-zinc-600">
                小计：<span className="font-semibold text-zinc-900">${(cartTotal / 100).toFixed(2)}</span>
              </div>

              {cart.items.length > 0 ? (
                <div className="mt-5 divide-y rounded-2xl border border-zinc-200 bg-white">
                  {cart.items.map((it) => (
                    <div key={it.menuItemId} className="flex items-center justify-between px-4 py-3 text-sm">
                      <div className="min-w-0 truncate text-zinc-700">{it.name}</div>
                      <div className="text-xs text-zinc-500">
                        {it.qty} × ${(it.unitPriceCents / 100).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="mt-6 text-xs text-zinc-500">
                建议提前预约，便于安排座位与准备。改期/退款请联系管理员人工处理。
              </div>

              <div className="mt-4 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-xs text-zinc-600">
                支付完成后会发送确认邮件。若未收到，请先查看垃圾邮箱。
              </div>

              <div className="mt-4 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-xs text-zinc-600">
                若需协助，请联系管理员人工处理，我们会尽力为你安排。
              </div>

              <div className="mt-3 text-xs text-zinc-500">{SITE.contact}</div>

              <ScriptureQuote className="mt-6" compact />

              <div className="mt-6 flex flex-wrap gap-2">
                <Link
                  href="/menu"
                  className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold hover:border-zinc-400"
                >
                  返回供斋
                </Link>
                <Link
                  href="/"
                  className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold hover:border-zinc-400"
                >
                  返回首页
                </Link>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      <Footer />
    </main>
  );
}
