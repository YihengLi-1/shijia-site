"use client";

import { useMemo, useState } from "react";

const PRESETS = [10, 20, 50, 100, 200, 500];
const MAX_AMOUNT = 9999;

const PRESET_CONTEXT: Record<number, { zh: string; en: string }> = {
  10:  { zh: "一日香灯供养", en: "one day of incense offerings" },
  20:  { zh: "一次素斋食材", en: "one meal's fresh ingredients" },
  50:  { zh: "一周日常运营", en: "a week of daily operations" },
  100: { zh: "一月香灯供养", en: "a month of incense & offerings" },
  200: { zh: "一月场所维护", en: "a month of facility upkeep" },
  500: { zh: "一季弘法活动", en: "a season of outreach dharma" },
};

function formatAmount(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function DonationClient() {
  const [amount, setAmount]   = useState(20);
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string>("");

  const amountCents = useMemo(() => Math.max(1, Math.round(amount * 100)), [amount]);

  async function onSubmit() {
    setError("");
    if (!email.trim()) {
      setError("请填写邮箱（用于收据与确认）· Please enter your email for receipt.");
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("随喜金额需大于 0 · Amount must be greater than $0.");
      return;
    }
    if (amount > MAX_AMOUNT) {
      setError(`单次随喜上限为 $${MAX_AMOUNT}，如需更大额请联系管理员。`);
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
      setError("随喜暂未完成，请稍后再试或联系管理员。 · Unable to process donation. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white p-6 soft-card">
      <div className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)] mb-4">
        随喜护持 · Make an Offering
      </div>

      <div className="space-y-5">
        {/* Amount presets */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)] mb-2.5">
            随喜金额 · Amount (USD)
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {PRESETS.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setAmount(v)}
                className={`amount-chip rounded-full border px-3.5 py-1.5 text-[12px] font-semibold pressable focus-ring ${
                  amount === v
                    ? "border-[var(--ink)] bg-[var(--ink)] text-white"
                    : "border-[var(--line)] bg-white text-[var(--ink-2)] hover:border-[var(--muted)]"
                }`}
                data-active={amount === v ? "true" : "false"}
              >
                ${v}
              </button>
            ))}
          </div>
          {PRESET_CONTEXT[amount] && (
            <p className="text-[11px] text-[var(--sage)] mb-3 fade-in">
              ≈ {PRESET_CONTEXT[amount].zh}
              <span className="text-[var(--muted)] ml-1">· {PRESET_CONTEXT[amount].en}</span>
            </p>
          )}
          <input
            type="number"
            min={1}
            max={MAX_AMOUNT}
            step={1}
            className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4 py-2.5 text-[13.5px] text-[var(--ink)] outline-none focus:border-[var(--sage)] transition-colors"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
          <p className="mt-1.5 text-[11px] text-[var(--muted)]">
            随喜金额：{formatAmount(amountCents)} · 上限 ${MAX_AMOUNT}
          </p>
        </div>

        {/* Name */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)] mb-2">
            姓名 · Name <span className="font-normal normal-case">（可选 · Optional）</span>
          </label>
          <input
            className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4 py-2.5 text-[13.5px] text-[var(--ink)] placeholder-[var(--muted)] outline-none focus:border-[var(--sage)] transition-colors"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="匿名可留空 · Leave blank to donate anonymously"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)] mb-2">
            邮箱 · Email <span className="font-normal normal-case text-red-500">（必填 · Required）</span>
          </label>
          <input
            type="email"
            className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4 py-2.5 text-[13.5px] text-[var(--ink)] placeholder-[var(--muted)] outline-none focus:border-[var(--sage)] transition-colors"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
          />
          <p className="mt-1 text-[11px] text-[var(--muted)]">用于发送收据与确认 · Used for receipt and confirmation</p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[12.5px] text-red-700">
            {error}
          </div>
        )}

        <button
          onClick={onSubmit}
          disabled={loading}
          className="w-full rounded-full py-3 text-[13.5px] font-semibold disabled:opacity-50 disabled:cursor-not-allowed pressable cta-shimmer temple-cta"
        >
          {loading ? "处理中… Processing…" : "随喜护持 · Donate"}
        </button>

        <p className="text-[11px] text-[var(--muted)]">
          如需核对信息，请通过电话或邮件联系管理员。
          <span className="ml-1 opacity-70">· Contact admin to verify records.</span>
        </p>
      </div>
    </div>
  );
}
