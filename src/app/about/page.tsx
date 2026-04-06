import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Container from "@/components/Container";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "关于道场 · About",
  description: "释迦佛国素食斋由三位出家法师于2024年创立，坐落于加州拉哈布拉高地，以素食供斋、以道场接引有缘。",
  openGraph: {
    title: "关于释迦佛国素食斋 · About the Sanctuary",
    description: "Founded in 2024 by three resident monastics in La Habra Heights, CA. A place of quiet practice, vegetarian offering, and community.",
    images: [{ url: "/photo-altar.jpg", width: 1200, height: 900, alt: "释迦佛国道场佛坛" }],
  },
};

const MONASTICS = [
  {
    zh: "释圆虚",
    en: "Ven. Shi Yuan Xu",
    role: "住持",
    roleEn: "Abbot",
    desc: "主持道场日常法务及修行引导，以清净之心接引来访十方善信。",
  },
  {
    zh: "释圆华",
    en: "Ven. Shi Yuan Hua",
    role: "监院",
    roleEn: "Prior",
    desc: "负责道场内务与供斋事宜，以勤劳和慈悲护持大众饮食修行。",
  },
  {
    zh: "释法常",
    en: "Ven. Shi Fa Chang",
    role: "知客",
    roleEn: "Guest Master",
    desc: "迎接十方来访善信，引导初来者了解道场礼仪与修行方式。",
  },
];

const PRINCIPLES = [
  { zh: "素净供斋", en: "Pure Vegetarian Offering", desc: "以时令素食供养大众，不求精美，只求清净。每一餐都是修行的延伸。" },
  { zh: "随缘接引", en: "Welcoming All Who Seek", desc: "不论背景与信仰，有缘者皆可来访。道场是开放的，心是开放的。" },
  { zh: "简朴修行", en: "Simple Practice", desc: "不繁文缛节，不讲究排场。以最简单的方式，守护内心的清明。" },
  { zh: "回向众生", en: "Dedication to All Beings", desc: "一切供斋、护持与法务，皆回向给法界一切众生，愿共安稳吉祥。" },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <Header />

      {/* ── Hero ──────────────────────────── */}
      <section className="page-content-sm fade-in">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            {/* Left: text */}
            <div className="rise-in">
              <p className="eyebrow mb-6">· 关于道场 · About ·</p>
              <h1 className="text-[clamp(2.4rem,7vw,4.4rem)] font-semibold serif-title leading-[1.08] tracking-[-0.02em] text-[var(--ink)]">
                释迦佛国<br />素食斋
              </h1>
              <div className="red-rule mt-5 mb-4" />
              <p className="text-[14px] font-light italic tracking-[0.04em] text-[var(--muted)] font-display mb-6">
                Shijia Vegetarian Sanctuary
              </p>
              <p className="text-[15px] text-[var(--ink-2)] leading-[1.9] max-w-lg">
                坐落于加州拉哈布拉高地的幽静山间，释迦佛国素食斋是一处供斋、修行与缘聚的清净道场。
                这里不是餐厅，是寺院的一角——以素食为媒，与十方有缘者共享片刻清明。
              </p>
              <p className="mt-3 text-[13px] text-[var(--muted)] leading-[1.8] max-w-lg">
                Nestled in the hills of La Habra Heights, California, the Shijia Vegetarian Sanctuary
                is a place of quiet practice, vegetarian offering, and community. Not a restaurant —
                a corner of the temple, where a simple meal becomes a moment of stillness.
              </p>

              {/* Founding badge */}
              <div className="mt-8 inline-flex items-center gap-4 border border-[var(--line)] rounded-full px-5 py-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--red)]" />
                <span className="text-[12px] text-[var(--ink-2)] tracking-[0.06em]">
                  2024年3月16日 创立于加利福尼亚州
                </span>
              </div>
            </div>

            {/* Right: altar photo */}
            <div className="relative overflow-hidden rounded-2xl hidden lg:block rise-in stagger-2" style={{ aspectRatio: "4/5" }}>
              <Image
                src="/photo-altar.jpg"
                alt="释迦佛国道场佛坛"
                fill
                className="object-cover"
                sizes="40vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5">
                <p className="text-white/90 text-[13px] font-serif leading-[1.6]">
                  道场佛坛 · The Sanctuary Altar
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Three Monastics ─────────────────── */}
      <section className="py-16 border-t border-[var(--line)]">
        <Container>
          <div className="mb-10 rise-in">
            <p className="eyebrow mb-3">· 常住法师 · Resident Monastics ·</p>
            <p className="text-[13px] text-[var(--muted)] max-w-lg">
              道场由三位出家法师共同创立与住持，以身示范清净修行之道。
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {MONASTICS.map((m, i) => (
              <div
                key={m.zh}
                className="rounded-2xl border border-[var(--line)] p-6 soft-card rise-in"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                {/* Seal-style name mark */}
                <div
                  className="w-10 h-10 border border-[var(--red)] flex items-center justify-center mb-4"
                  style={{ color: "var(--red)", fontSize: "14px", fontFamily: "serif" }}
                >
                  {m.zh.slice(-1)}
                </div>
                <h3 className="text-[1.15rem] font-semibold serif-title text-[var(--ink)] mb-0.5">{m.zh}</h3>
                <p className="text-[11.5px] text-[var(--muted)] tracking-[0.08em] mb-1">{m.en}</p>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[11px] text-[var(--red)] tracking-[0.1em]">{m.role}</span>
                  <span className="text-[10.5px] text-[var(--muted)]">· {m.roleEn}</span>
                </div>
                <p className="text-[13px] text-[var(--ink-2)] leading-[1.75]">{m.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Principles ───────────────────── */}
      <section className="py-16 border-t border-[var(--line)]">
        <Container>
          <div className="mb-10 rise-in">
            <p className="eyebrow mb-3">· 道场精神 · Our Principles ·</p>
          </div>
          <div className="grid gap-px bg-[var(--line)] sm:grid-cols-2 lg:grid-cols-4 rounded-2xl overflow-hidden">
            {PRINCIPLES.map((p, i) => (
              <div
                key={p.zh}
                className="bg-[var(--bg)] px-6 py-7 rise-in"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="eyebrow mb-3">{String(i + 1).padStart(2, "0")}</div>
                <h4 className="text-[1.05rem] font-semibold serif-title text-[var(--ink)] mb-1">{p.zh}</h4>
                <p className="text-[11px] text-[var(--muted)] tracking-[0.08em] mb-4">{p.en}</p>
                <p className="text-[13px] text-[var(--ink-2)] leading-[1.8]">{p.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Location ─────────────────────── */}
      <section className="py-16 border-t border-[var(--line)]">
        <Container>
          <div className="grid gap-10 lg:grid-cols-2 items-start">
            <div className="rise-in">
              <p className="eyebrow mb-4">· 道场位置 · Location ·</p>
              <h2 className="text-[1.6rem] font-semibold serif-title text-[var(--ink)] mb-4">
                拉哈布拉高地，加利福尼亚
              </h2>
              <p className="text-[13.5px] text-[var(--ink-2)] leading-[1.9] mb-6 max-w-md">
                道场坐落于洛杉矶郡拉哈布拉高地的山丘之上，远离市区喧嚣，居高临下，自有一份清明与安静。
              </p>
              <div className="space-y-3 text-[13px] text-[var(--ink-2)]">
                <div className="flex gap-3">
                  <span className="text-[var(--muted)] w-16 shrink-0">地址</span>
                  <span>1820 Sharpless Dr, La Habra Heights, CA 90631</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-[var(--muted)] w-16 shrink-0">开放</span>
                  <span>每日 5:00 AM — 9:00 PM</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-[var(--muted)] w-16 shrink-0">到访</span>
                  <span>建议提前联系，轻声进入，着装整洁</span>
                </div>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/visit"
                  className="rounded-full bg-[var(--ink)] text-[var(--bg)] px-5 py-2.5 text-[13px] font-medium pressable"
                >
                  来访须知 →
                </Link>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=1820+Sharpless+Dr,+La+Habra+Heights,+CA+90631"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-[var(--line)] bg-white/70 px-5 py-2.5 text-[13px] font-medium pressable temple-ghost"
                >
                  地图导航 · Maps →
                </a>
              </div>
            </div>

            {/* Monk photo */}
            <div className="relative overflow-hidden rounded-2xl rise-in stagger-2" style={{ aspectRatio: "3/2" }}>
              <Image
                src="/photo-monk-bell.jpg"
                alt="道场法师"
                fill
                className="object-cover"
                sizes="50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>
          </div>
        </Container>
      </section>

      {/* ── Connection ────────────────────── */}
      <section className="py-14 border-t border-[var(--line)]">
        <Container>
          <div className="max-w-2xl rise-in">
            <p className="eyebrow mb-4">· 同根道场 · Sister Sanctuary ·</p>
            <p className="text-[13.5px] text-[var(--ink-2)] leading-[1.9] mb-6">
              释迦佛国素食斋与释迦佛国（Vishva Bauddha Sangha）同属一处道场。
              佛国以觉知生活为使命，融合传统佛法与当代正念，服务南加州华人及各族裔社区。
            </p>
            <a
              href="https://vishvabauddhasangha.com"
              target="_blank"
              rel="noreferrer"
              className="text-[13px] text-[var(--ink-2)] underline underline-offset-4 decoration-[var(--line)] hover:decoration-[var(--ink-2)] transition-colors"
            >
              了解释迦佛国 · Vishva Bauddha Sangha →
            </a>
          </div>
        </Container>
      </section>

      <Footer />
    </main>
  );
}
