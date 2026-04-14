import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Container from "@/components/Container";
import Footer from "@/components/Footer";
import { SITE } from "@/lib/site";
import ScriptureQuote from "@/components/ScriptureQuote";

export const metadata: Metadata = {
  title: "到访 · Visit",
  description: "到访释迦佛国素食斋的礼仪指引与交通信息。Etiquette, directions, and visit information for Shijia Vegetarian Sanctuary.",
};

export default function VisitPage() {
  return (
    <main className="min-h-screen">
      <Header hideCta />

      {/* ── Hero ──────────────────────────────────── */}
      <section className="page-content-sm fade-in">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="rise-in">
              <p className="eyebrow mb-6">· 到访 · Visit ·</p>
              <h1 className="text-[clamp(2.2rem,7vw,4.2rem)] font-semibold serif-title leading-[1.08] tracking-[-0.02em] text-[var(--ink)]">
                来访须知
              </h1>
              <div className="red-rule mt-5 mb-4" />
              <p className="text-[14px] font-light italic tracking-[0.04em] text-[var(--muted)] font-display">
                Visiting the Sanctuary
              </p>
              <p className="mt-5 text-[14px] text-[var(--ink-2)] leading-[1.85] max-w-lg">
                到访以安静为先，轻声慢行即可。
              </p>
              <p className="mt-1.5 text-[12.5px] text-[var(--muted)] max-w-lg">
                Enter quietly, move slowly. The space asks nothing more.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/menu" className="rounded-full px-5 py-2.5 text-[13px] font-semibold pressable cta-shimmer temple-cta">
                  前往供斋 · Order
                </Link>
                <a href={SITE.mapUrl} target="_blank" rel="noreferrer" className="rounded-full px-5 py-2.5 text-[13px] font-medium pressable temple-ghost">
                  导航 · Directions
                </a>
              </div>
            </div>
            {/* Photo */}
            <div className="relative overflow-hidden rounded-2xl group rise-in stagger-2 hidden lg:block" style={{ aspectRatio: "4/5" }}>
              <Image
                src="/photo-monk-bell.jpg"
                alt="法师击钟 · Monastic ringing the bell"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                sizes="35vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              <div className="absolute top-4 left-4 w-7 h-7 border border-white/30 flex items-center justify-center">
                <span className="text-white/70 serif-title text-[10px]">到</span>
              </div>
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
              <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] rise-in">

                {/* Left column */}
                <div className="space-y-5">
                  <div className="rounded-2xl border border-[var(--line)] bg-white p-6 soft-card">
                    <div className="eyebrow mb-4">来访礼仪 · Etiquette</div>
                    <div className="space-y-4">
                      {[
                        { zh: "轻声入门，缓慢行走", en: "Enter quietly, move with care" },
                        { zh: "尊重秩序，保持整洁", en: "Respect the space and others" },
                        { zh: "合掌感恩，安住身心", en: "Bow in gratitude, be present" },
                        { zh: "缓慢用斋，少说多感", en: "Eat slowly, fewer words" },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between py-2.5 border-b border-[var(--line-2)] last:border-0">
                          <span className="text-[13.5px] text-[var(--ink-2)]">{item.zh}</span>
                          <span className="text-[11.5px] text-[var(--muted)] ml-4 text-right">{item.en}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[var(--line)] bg-[var(--gold-bg)]/50 px-6 py-5 soft-card">
                    <div className="flex items-start gap-3">
                      <svg className="mt-0.5 shrink-0 text-[var(--gold)]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                      <div>
                        <p className="text-[13px] text-[var(--ink-2)] leading-[1.75]">
                          若迟到或需改期，请提前联系管理员，以便安排座位与供斋准备。
                        </p>
                        <p className="text-[11.5px] text-[var(--muted)] mt-1">
                          If you're running late or need to reschedule, please contact us in advance.
                        </p>
                      </div>
                    </div>
                  </div>

                  <ScriptureQuote compact variant="general" />
                </div>

                {/* Right column */}
                <div className="space-y-5">
                  <div className="rounded-2xl border border-[var(--line)] bg-white p-6 soft-card">
                    <div className="eyebrow mb-4">来访信息 · Practical Info</div>
                    <div className="divide-y divide-[var(--line-2)]">
                      {[
                        { label: "停车 · Parking",      val: "车位有限，请按指引停放", valEn: "Limited — follow on-site signs" },
                        { label: "入口 · Entrance",      val: "以当天指示为准",         valEn: "Follow day-of signage" },
                        { label: "预约 · Reservation",   val: "建议提前一天",           valEn: "Recommended day before" },
                        { label: "营业 · Hours",         val: SITE.hours,              valEn: SITE.hoursEn },
                        { label: "地址 · Address",       val: SITE.address,            valEn: "" },
                      ].map((row) => (
                        <div key={row.label} className="flex items-start justify-between py-3 gap-3">
                          <span className="text-[12px] font-medium text-[var(--ink-2)] shrink-0">{row.label}</span>
                          <span className="text-right">
                            <span className="block text-[12.5px] text-[var(--ink-2)]">{row.val}</span>
                            {row.valEn && <span className="block text-[11px] text-[var(--muted)]">{row.valEn}</span>}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[var(--line)] bg-white p-5 soft-card">
                    <div className="eyebrow mb-3">简要提醒 · Quick Reminders</div>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { zh: "预约确认", en: "Reserve first" },
                        { zh: "安静到访", en: "Enter quietly" },
                        { zh: "缓慢用斋", en: "Eat mindfully" },
                        { zh: "整洁着装", en: "Dress neatly" },
                      ].map((chip) => (
                        <span key={chip.zh} className="inline-flex items-center gap-1 rounded-full border border-[var(--line)] bg-[var(--sage-bg)] px-3 py-1 text-[11.5px] text-[var(--ink-2)]">
                          {chip.zh}<span className="text-[var(--muted)]">· {chip.en}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Google Maps */}
              <div className="mt-8 overflow-hidden rounded-2xl border border-[var(--line)] bg-white soft-card rise-in stagger-3">
                <div className="px-6 pt-5 pb-3 flex items-center justify-between">
                  <div>
                    <div className="eyebrow mb-1">位置 · Location</div>
                    <p className="text-[13.5px] font-medium text-[var(--ink)]">{SITE.address}</p>
                  </div>
                  <a href={SITE.mapUrl} target="_blank" rel="noreferrer" className="rounded-full border border-[var(--line)] bg-[var(--bg)] px-3.5 py-1.5 text-[11.5px] font-medium text-[var(--ink-2)] pressable temple-ghost">
                    在地图中打开
                  </a>
                </div>
                <div className="relative h-[320px] sm:h-[400px] bg-[var(--surface-2)]">
                  {SITE.mapEmbedUrl && !SITE.mapEmbedUrl.includes("0x0") ? (
                    <iframe
                      title="Shijia Vegetarian Sanctuary location"
                      width="100%"
                      height="100%"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      src={SITE.mapEmbedUrl}
                      className="border-0 w-full h-full"
                      aria-label="Google Maps showing Shijia Vegetarian Sanctuary location"
                    />
                  ) : (
                    <a href={SITE.mapUrl} target="_blank" rel="noreferrer" className="flex h-full w-full flex-col items-center justify-center gap-4 text-center hover:bg-[var(--line-2)] transition-colors">
                      <div className="rounded-full border border-[var(--line)] bg-white p-5">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--sage)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                          <circle cx="12" cy="9" r="2.5"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-[13.5px] font-medium text-[var(--ink-2)]">1820 Sharpless Dr</p>
                        <p className="text-[12px] text-[var(--muted)]">La Habra Heights, CA 90631</p>
                        <p className="mt-2 text-[11.5px] text-[var(--red)] font-medium">点击在 Google Maps 中打开 →</p>
                      </div>
                    </a>
                  )}
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
