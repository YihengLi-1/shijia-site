"use client";

import { useMemo, useState } from "react";

function formatAmount(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function DonationClient() {
  const [amount, setAmount] = useState(20);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const amountCents = useMemo(() => Math.max(1, Math.round(amount * 100)), [amount]);

  async function onSubmit() {
    setError("");
    if (!email.trim()) {
      setError("请填写邮箱（用于收据与确认）");
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("随喜金额需大于 0");
      return;
    }

    setLoading(true);
    try {
      const r1 = await fetch("/donation/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountCents,
          currency: "usd",
          email: email.trim(),
          name: name.trim() || undefined,
        }),
      });
      const j1 = await r1.json().catch(() => ({}));
      if (!r1.ok || !j1?.ok) {
        throw new Error(j1?.error || "donation_create_failed");
      }

      const donationId = String(j1?.donationId || "");
      if (!donationId) throw new Error("missing_donationId");

      const r2 = await fetch("/donation/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ donationId }),
      });
      const j2 = await r2.json().catch(() => ({}));
      if (!r2.ok || !j2?.ok) {
        throw new Error(j2?.error || "donation_checkout_failed");
      }

      const url = String(j2?.url || "");
      if (!url) throw new Error("missing_checkout_url");

      window.location.href = url;
    } catch {
      setError("随喜暂未完成，请稍后再试或联系管理员。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <aside className="rounded-3xl border border-zinc-200/70 bg-white/80 p-6 shadow-sm soft-card">
      <div className="flex items-center gap-3">
        <div
          className="h-10 w-10 rounded-full border border-zinc-200 bg-white"
          style={{ background: 'url("/lotus.svg") center/contain no-repeat' }}
        />
        <div>
          <div className="text-sm font-semibold text-zinc-900">随喜护持</div>
          <div className="text-xs text-zinc-500">随缘供养 · 清净回向</div>
        </div>
      </div>
      <p className="mt-2 text-sm text-zinc-600">
        随缘供养，用于供斋与场所维护。
      </p>

      <div className="mt-5 space-y-4">
        <div>
          <label className="text-xs font-semibold text-zinc-500">随喜金额（USD）</label>
          <div className="mt-2 flex items-center gap-2">
            {[10, 20, 50, 100].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setAmount(v)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold pressable focus-ring ${
                  amount === v
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400"
                }`}
              >
                ${v}
              </button>
            ))}
          </div>
          <input
            type="number"
            min={1}
            step={1}
            className="mt-3 w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-zinc-400"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
          <div className="mt-2 text-xs text-zinc-500">当前金额：{formatAmount(amountCents)}</div>
        </div>

        <div>
          <label className="text-xs font-semibold text-zinc-500">姓名（可选）</label>
          <input
            className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-zinc-400"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="匿名可留空"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-zinc-500">邮箱（收据与确认）</label>
          <input
            className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-zinc-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
          />
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <button
          onClick={onSubmit}
          disabled={loading}
          className="w-full rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-60 cta-glow pressable focus-ring"
        >
          {loading ? "处理中..." : "随喜护持"}
        </button>

        <div className="text-xs text-zinc-500">
          退款为人工处理，如需协助请通过电话或邮件联系。
        </div>
      </div>
    </aside>
  );
}
