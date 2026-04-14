import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Container from "@/components/Container";
import Footer from "@/components/Footer";
import ScriptureQuote from "@/components/ScriptureQuote";
import ChipReveal from "@/components/ChipReveal";

export const metadata: Metadata = {
  title: "素食斋 · Pure Vegetarian",
  description: "了解释迦佛国素食斋的清净素食理念。Learn about the pure vegetarian philosophy at Shijia Vegetarian Sanctuary.",
};

export default function VeggiePage() {
  return (
    <main className="min-h-screen">
      <Header hideCta />

      {/* ── Hero ──────────────────────────────────── */}
      <section className="page-content-sm fade-in">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="rise-in">
              <p className="eyebrow mb-6">· 清净素食 · Pure Vegetarian ·</p>
              <h1 className="text-[clamp(2.2rem,7vw,4.2rem)] font-semibold serif-title leading-[1.08] tracking-[-0.02em] text-[var(--ink)]">
                清净素斋
              </h1>
              <div className="red-rule mt-5 mb-4" />
              <p className="text-[14px] font-light italic tracking-[0.04em] text-[var(--muted)] font-display">
                Pure Vegetarian Offering
              </p>
              <p className="mt-5 text-[14px] text-[var(--ink-2)] leading-[1.85] max-w-xl">
                这里不是菜单，而是一餐清净之缘。少油少盐，不求繁复，只求安住与感恩。
              </p>
              <p className="mt-2 text-[12.5px] text-[var(--muted)] max-w-xl">
                This is not just a menu — it is an offering. Light seasoning, no complexity. Simply presence, and gratitude.
              </p>
            </div>
            {/* Photo */}
            <div className="relative overflow-hidden rounded-2xl group rise-in stagger-2 hidden lg:block" style={{ aspectRatio: "4/5" }}>
              <Image
                src="/photo-monk-cup.jpg"
                alt="法师供茶 · Monastic offering tea"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                sizes="35vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              <div className="absolute top-4 left-4 w-7 h-7 border border-white/30 flex items-center justify-center">
                <span className="text-white/70 serif-title text-[10px]">素</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 px-4 pb-4">
                <p className="text-white/80 text-[12px] serif-title">缓慢用斋</p>
                <p className="text-white/45 text-[10.5px] italic font-display mt-0.5">Eat slowly, with gratitude</p>
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
              <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] rise-in">

                {/* Left */}
                <div className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {[
                      { key: "light", zh: "清淡之味", en: "Light Flavors", desc: "取当季之食，味淡而不寡，清净而有度。", descEn: "Seasonal ingredients, lightly prepared — clear but never empty." },
                      { key: "slow", zh: "缓慢用斋", en: "Slow Dining", desc: "慢一些、少一些、足够即可，让心念回到当下。", descEn: "Slower, quieter, just enough — letting the mind return to now." },
                      { key: "gratitude", zh: "感恩供养", en: "Grateful Offering", desc: "念食材、念供养、念众缘。愿一餐之缘，成为修行之缘。", descEn: "Mindful of ingredients, of offering, of all conditions.", wide: true },
                    ].map((card) => (
                      <div key={card.key} className={`rounded-2xl border border-[var(--line)] bg-white p-5 soft-card ${card.wide ? "sm:col-span-2" : ""}`}>
                        <div className="eyebrow mb-2">{card.en}</div>
                        <h2 className="mt-2 text-[17px] font-semibold serif-title text-[var(--ink)]">{card.zh}</h2>
                        <p className="mt-2 text-[13px] text-[var(--ink-2)] leading-[1.75]">{card.desc}</p>
                        <p className="mt-1 text-[11.5px] text-[var(--muted)] italic">{card.descEn}</p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-2xl border border-[var(--line)] bg-white p-5 soft-card">
                    <div className="eyebrow mb-3">修行之念 · Intentions</div>
                    <ChipReveal
                      items={[
                        { label: "少欲", note: "少欲则心轻，味也轻。Fewer desires, lighter heart." },
                        { label: "知足", note: "一餐足矣，心不多求。One meal is enough; the heart asks no more." },
                        { label: "感恩", note: "念众缘与供养，心自安。Gratitude for all conditions — peace follows." },
                      ]}
                    />
                  </div>

                  <div className="flex flex-wrap gap-3 pt-1">
                    <Link href="/menu" className="rounded-full px-5 py-2.5 text-[13px] font-semibold pressable cta-shimmer temple-cta">
                      查看今日供斋 · Today's Menu
                    </Link>
                    <Link href="/visit" className="rounded-full border border-[var(--line)] bg-white/70 px-5 py-2.5 text-[13px] font-medium pressable temple-ghost">
                      到访礼序 · Visiting →
                    </Link>
                  </div>
                </div>

                {/* Right */}
                <div className="space-y-5">
                  <aside className="rounded-2xl border border-[var(--line)] bg-white p-6 soft-card">
                    <div className="eyebrow mb-4">斋前一念 · Before the Meal</div>
                    <p className="text-[13px] text-[var(--ink-2)] leading-[1.8]">
                      合掌静心，愿此一餐成为修行之缘，愿身心安稳、念念清净。
                    </p>
                    <p className="mt-2 text-[11.5px] text-[var(--muted)] italic">
                      Hands together, still the mind. May this meal become a moment of practice.
                    </p>
                    <div className="mt-5 space-y-2.5">
                      {[
                        { zh: "当季时蔬 · 清淡汤品 · 当日主食", en: "Seasonal vegetables · Light soups · Daily grains" },
                        { zh: "甜品与饮品 · 随缘供应",           en: "Sweets & drinks · As available" },
                        { zh: "清简为主 · 量足即可",             en: "Simple by design · Just enough" },
                      ].map((row) => (
                        <div key={row.zh} className="rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3">
                          <p className="text-[12.5px] text-[var(--ink-2)]">{row.zh}</p>
                          <p className="text-[11px] text-[var(--muted)] mt-0.5">{row.en}</p>
                        </div>
                      ))}
                    </div>
                    <ScriptureQuote className="mt-6" compact variant="meal" />
                  </aside>

                  <div className="rounded-2xl border border-[var(--line)] bg-[var(--gold-bg)]/50 px-5 py-4 soft-card">
                    <div className="eyebrow mb-2.5">食材说明 · About Ingredients</div>
                    <p className="text-[12.5px] text-[var(--ink-2)] leading-[1.75]">
                      本素斋严格纯素，不含五辛（葱、蒜、韭、薤、兴渠）。如有过敏或特殊需求，请提前告知。
                    </p>
                    <p className="text-[11px] text-[var(--muted)] mt-1.5">
                      Strictly plant-based, no five pungents. Please inform us of any allergies in advance.
                    </p>
                  </div>
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
