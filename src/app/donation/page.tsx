import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Container from "@/components/Container";
import DonationClient from "./DonationClient";
import Footer from "@/components/Footer";
import ScriptureQuote from "@/components/ScriptureQuote";

export const metadata: Metadata = {
  title: "随喜 · Donate",
  description: "随喜护持释迦佛国素食斋。Support Shijia Vegetarian Sanctuary with a joyful offering.",
};

export default function DonationPage() {
  return (
    <main className="min-h-screen">
      <Header hideCta />

      {/* ── Hero ──────────────────────────────────── */}
      <section className="page-content-sm fade-in">
        <Container>
          <div className="flex gap-6 lg:gap-10">
            <div className="hidden lg:flex flex-col items-center shrink-0 w-8 pt-1">
              <div className="vertical-label">随喜护持</div>
            </div>
            <div className="flex-1 min-w-0 rise-in max-w-2xl">
              <p className="eyebrow mb-6">· 随喜护持 · Support ·</p>
              <h1 className="text-[clamp(2.2rem,7vw,4.2rem)] font-semibold serif-title leading-[1.08] tracking-[-0.02em] text-[var(--ink)]">
                随喜
              </h1>
              <div className="red-rule mt-5 mb-4" />
              <p className="text-[14px] font-light italic tracking-[0.04em] text-[var(--muted)] font-display">
                Joyful Giving
              </p>
              <p className="mt-5 text-[14px] text-[var(--ink-2)] leading-[1.85] max-w-xl">
                随喜非为交换，只是愿意共护一处清净之所。愿此护持，回向众生安稳。
              </p>
              <p className="mt-2 text-[12.5px] text-[var(--muted)] max-w-xl">
                This is not a transaction. It is simply a willingness to help sustain a quiet place of practice.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Main content ──────────────────────────── */}
      <section className="pb-20">
        <Container>
          <div className="flex gap-6 lg:gap-10">
            <div className="hidden lg:block w-8 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="mb-8 ink-divider" />
              <div className="grid gap-8 lg:grid-cols-[1fr_1fr] rise-in">

                {/* Left */}
                <div className="space-y-5">
                  <div className="rounded-2xl border border-[var(--line)] bg-white p-6 soft-card">
                    <div className="eyebrow mb-4">护持用途 · How Donations Are Used</div>
                    <div className="divide-y divide-[var(--line-2)]">
                      {[
                        { zh: "香灯供养", en: "Incense & lighting" },
                        { zh: "供斋食材", en: "Meal ingredients" },
                        { zh: "场所维护", en: "Facility maintenance" },
                        { zh: "日常运营", en: "Daily operations" },
                      ].map((row) => (
                        <div key={row.zh} className="flex items-center justify-between py-3">
                          <span className="text-[13px] text-[var(--ink-2)]">{row.zh}</span>
                          <span className="text-[11.5px] text-[var(--muted)]">{row.en}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[var(--sage-bg)] bg-[var(--sage-bg)] px-6 py-5 soft-card">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0 text-[var(--sage)]">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-[13px] text-[var(--ink-2)] leading-[1.75]">
                          随喜记录将妥善保存。如需核对，请提供随喜编号，便于人工协助。
                        </p>
                        <p className="text-[11.5px] text-[var(--muted)] mt-1">
                          All donation records are kept. Contact us with your reference number to verify.
                        </p>
                      </div>
                    </div>
                  </div>

                  <ScriptureQuote compact variant="compassion" />

                  <div className="flex flex-wrap gap-3">
                    <Link href="/" className="rounded-full border border-[var(--line)] bg-white/70 px-5 py-2.5 text-[13px] font-medium pressable temple-ghost">
                      返回首页 · Home
                    </Link>
                    <Link href="/menu" className="rounded-full border border-[var(--line)] bg-white/70 px-5 py-2.5 text-[13px] font-medium pressable temple-ghost">
                      前往供斋 · Dining
                    </Link>
                  </div>
                </div>

                {/* Right: form */}
                <div>
                  <DonationClient />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <Footer />
    </main>
  );
}
