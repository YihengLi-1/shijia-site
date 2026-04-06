// src/app/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Container from "@/components/Container";
import { SITE } from "@/lib/site";
import Footer from "@/components/Footer";
import ScriptureQuote from "@/components/ScriptureQuote";
import WhySection from "@/components/WhySection";
import OpenStatus from "@/components/OpenStatus";
import HomeTodayMenu from "@/components/HomeTodayMenu";

export const metadata: Metadata = {
  title: `${SITE.name} · ${SITE.nameEn}`,
  description: `${SITE.tagline.replace(/\n/g, " ")} — ${SITE.taglineEn.replace(/\n/g, " ")}`,
};

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header hideCta />

      {/* ── Full-bleed hero photo ─────────────────────── */}
      <div className="relative overflow-hidden" style={{ height: "72vh", minHeight: 420, maxHeight: 700 }}>
        <Image
          src="/photo-altar.jpg"
          alt="释迦佛国道场"
          fill
          className="object-cover object-center"
          sizes="100vw"
          priority
        />
        {/* Gradient: dark at bottom for text, lighter at top */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/65 pointer-events-none" />

        {/* Bottom-left: name + tagline */}
        <div className="absolute bottom-0 left-0 right-0 px-6 md:px-10 pb-8 md:pb-10">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-white text-[clamp(1.8rem,5vw,3.2rem)] font-semibold serif-title leading-[1.1] tracking-tight drop-shadow-sm">
                {SITE.name}
              </h1>
              <p className="text-white/65 text-[13px] italic font-display mt-1 tracking-[0.05em]">
                {SITE.nameEn}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <OpenStatus />
              <Link
                href="/menu"
                className="rounded-full px-5 py-2.5 text-[13px] font-semibold pressable cta-shimmer"
                style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff" }}
              >
                开始供斋 →
              </Link>
            </div>
          </div>
        </div>

        {/* Seal top-right */}
        <div className="absolute top-5 right-6 w-9 h-9 border border-white/25 flex items-center justify-center">
          <span className="text-white/60 serif-title text-[12px]">释</span>
        </div>
      </div>

      {/* ── Below hero: tagline + info ────────────────── */}
      <section className="py-14 md:py-16 fade-in">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">

            {/* Left: tagline */}
            <div className="rise-in">
              <div className="flex items-center gap-4 mb-6">
                <p className="eyebrow">· 清净供斋 · Pure Offering ·</p>
              </div>
              <p className="text-[clamp(1rem,2vw,1.2rem)] leading-[2] text-[var(--ink-2)] whitespace-pre-line mb-2">
                {SITE.tagline}
              </p>
              <p className="text-[13px] leading-[1.8] text-[var(--muted)] mb-8">
                {SITE.taglineEn}
              </p>
              <div className="flex items-center gap-6">
                <Link href="/menu" className="rounded-full px-6 py-3 text-[13.5px] font-semibold pressable cta-shimmer temple-cta">
                  开始供斋
                </Link>
                <Link href="/veggie" className="text-[13px] text-[var(--ink-2)] hover:text-[var(--ink)] transition-colors pb-px" style={{ borderBottom: "1px solid rgba(23,17,12,0.14)" }}>
                  清净素斋 →
                </Link>
              </div>
            </div>

            {/* Right: practical info */}
            <div className="rise-in stagger-1 pt-1">
              {[
                { label: "Hours",    zh: SITE.hoursEn,   sub: SITE.hours },
                { label: "Location", zh: SITE.address,   sub: null },
                { label: "Contact",  zh: SITE.phone !== "+1XXXXXXXXXX" ? SITE.phone : "现场或提前预约", sub: SITE.contactEn },
              ].map((item) => (
                <div key={item.label} className="flex items-baseline gap-5 py-3.5" style={{ borderBottom: "1px solid var(--line)" }}>
                  <div className="eyebrow w-20 shrink-0">{item.label}</div>
                  <div>
                    <div className="text-[13px] font-medium text-[var(--ink)] leading-snug">{item.zh}</div>
                    {item.sub && <div className="text-[11.5px] text-[var(--muted)] mt-0.5">{item.sub}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ── Today's menu preview ─────────────────────── */}
      <section className="pb-4">
        <Container>
          <div style={{ borderTop: "1px solid var(--line)", paddingTop: "3rem" }}>
            <HomeTodayMenu />
          </div>
        </Container>
      </section>

      {/* ── Scripture + Why ───────────────────────────── */}
      <section className="pb-20">
        <Container>
          <div style={{ borderTop: "1px solid var(--line)", paddingTop: "3rem", paddingBottom: "2.5rem" }}>
            <ScriptureQuote compact variant="general" />
          </div>
          <WhySection intro={SITE.intro} introEn={SITE.introEn} />
        </Container>
      </section>

      {/* ── Monk photos ───────────────────────────────── */}
      <section className="pb-20">
        <Container>
          <div style={{ borderTop: "1px solid var(--line)", paddingTop: "3rem" }}>
            <p className="eyebrow mb-6">道场印象 · The Sanctuary</p>
            <div className="grid grid-cols-2 gap-3 sm:gap-5">
              {[
                { src: "/photo-monk-bell.jpg", zh: "法会仪轨", en: "Dharma ceremony" },
                { src: "/photo-monk-cup.jpg",  zh: "供养仪式", en: "Offering ritual" },
              ].map((photo) => (
                <div key={photo.src} className="relative overflow-hidden rounded-xl group" style={{ aspectRatio: "3/4" }}>
                  <Image src={photo.src} alt={photo.zh} fill className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" sizes="(max-width: 640px) 50vw, 30vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent pointer-events-none" />
                  <div className="absolute bottom-0 left-0 right-0 px-4 pb-4">
                    <p className="text-white/90 text-[13px] serif-title">{photo.zh}</p>
                    <p className="text-white/50 text-[11px] italic font-display mt-0.5">{photo.en}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ── About teaser ──────────────────────────── */}
      <section className="pb-20">
        <Container>
          <div style={{ borderTop: "1px solid var(--line)", paddingTop: "3rem" }}>
            <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
              <div>
                <p className="eyebrow mb-2">常住法师 · Resident Monastics</p>
                <p className="text-[13px] text-[var(--muted)]">道场由三位出家法师共同创立与住持。</p>
              </div>
              <Link
                href="/about"
                className="rounded-full border border-[var(--line)] bg-white/70 px-4 py-2 text-[12.5px] font-medium pressable temple-ghost shrink-0"
              >
                了解道场 · About →
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { zh: "释圆虚", en: "Ven. Shi Yuan Xu", role: "住持", roleEn: "Abbot" },
                { zh: "释圆华", en: "Ven. Shi Yuan Hua", role: "监院", roleEn: "Prior" },
                { zh: "释法常", en: "Ven. Shi Fa Chang", role: "知客", roleEn: "Guest Master" },
              ].map((m) => (
                <Link
                  key={m.zh}
                  href="/about"
                  className="flex items-center gap-4 rounded-2xl border border-[var(--line)] bg-white/70 px-5 py-4 soft-card pressable hover:border-[var(--muted)] transition-colors"
                >
                  <div
                    className="w-9 h-9 border border-[var(--red)] flex items-center justify-center shrink-0"
                    style={{ color: "var(--red)", fontSize: "13px", fontFamily: "serif" }}
                  >
                    {m.zh.slice(-1)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[14px] font-semibold serif-title text-[var(--ink)] leading-snug">{m.zh}</div>
                    <div className="text-[11px] text-[var(--muted)] mt-0.5">{m.role} · {m.roleEn}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <Footer />
    </main>
  );
}
