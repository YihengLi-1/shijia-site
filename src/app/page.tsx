// src/app/page.tsx
import Link from "next/link";
import Header from "@/components/Header";
import Container from "@/components/Container";
import { SITE } from "@/lib/site";
import Footer from "@/components/Footer";
import ScriptureQuote from "@/components/ScriptureQuote";
import WhySection from "@/components/WhySection";

export default function Home() {
  return (
    <main className="min-h-screen text-zinc-900">
      <Header hideCta />

      <section className="section relative overflow-hidden fade-in">
        <div
          className="pointer-events-none absolute -top-8 right-10 h-48 w-48 rounded-full blur-3xl opacity-30"
          style={{ background: "radial-gradient(circle, #efe7da 0%, transparent 60%)" }}
        />
        <div
          className="pointer-events-none absolute bottom-10 left-8 h-56 w-56 rounded-full blur-3xl opacity-30"
          style={{ background: "radial-gradient(circle, #f2eadc 0%, transparent 60%)" }}
        />
        <div className="pointer-events-none absolute inset-0 lotus-pattern opacity-[0.12]" />
        <Container className="relative z-10">
          <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
            <div className="max-w-2xl rise-in">
              <div className="inline-flex items-center gap-3 rounded-full border border-zinc-200/70 bg-white/70 px-4 py-1 text-xs font-medium text-zinc-600">
                清净供斋
              </div>
              <h1 className="mt-6 text-[clamp(2.8rem,6vw,4.6rem)] font-semibold tracking-tight serif-title">
                {SITE.name}
              </h1>
              <p className="mt-5 whitespace-pre-line text-lg leading-7 text-zinc-700">{SITE.tagline}</p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/menu"
                  className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white hover:bg-zinc-800 pressable btn-glow cta-shimmer"
                >
                  开始供斋
                </Link>
                <Link href="/veggie" className="text-sm font-semibold text-zinc-600 hover:text-zinc-900">
                  清净素斋 →
                </Link>
              </div>

              <div className="mt-4 text-xs text-zinc-500">
                确认后将为你留席，并送上一条提醒；若需改期或退款，请联系管理员协助。
              </div>

              <div className="mt-8 grid gap-6 py-4 text-xs text-zinc-600 info-strip sm:grid-cols-3 sm:divide-x sm:divide-zinc-200/70">
                <div className="sm:pr-6">
                  <div className="text-[11px] font-semibold text-zinc-500">开放时间</div>
                  <div className="mt-2 text-sm text-zinc-800">{SITE.hours}</div>
                </div>
                <div className="sm:px-6">
                  <div className="text-[11px] font-semibold text-zinc-500">地址</div>
                  <div className="mt-2 text-sm text-zinc-800">{SITE.address}</div>
                </div>
                <div className="sm:pl-6">
                  <div className="text-[11px] font-semibold text-zinc-500">联系</div>
                  <div className="mt-2 text-sm text-zinc-800">{SITE.contact}</div>
                </div>
              </div>
            </div>

            <div className="relative rise-in stagger-2">
              <div className="relative overflow-hidden rounded-[32px] border border-zinc-200/70 bg-white/85 p-8 shadow-sm soft-card">
                <div
                  className="absolute inset-0 opacity-90"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0.95) 100%), url("/hero.svg") center/cover no-repeat',
                  }}
                />
                <div
                  className="absolute -right-10 -bottom-12 h-40 w-40 opacity-20"
                  style={{ background: 'url("/lotus.svg") center/contain no-repeat' }}
                />
                <div className="relative z-10">
                  <div className="text-xs font-semibold text-zinc-500">今日供斋</div>
                  <div className="mt-3 text-xl font-semibold serif-title text-zinc-900">
                    清淡 · 安住 · 随缘
                  </div>
                  <p className="mt-2 text-sm text-zinc-700">
                    以清净为本，随缘供斋。愿你安静到访，心与味同静。
                  </p>

                  <div className="mt-6 space-y-3 text-sm text-zinc-700">
                    <div className="flex items-center justify-between">
                      <span>供斋方式</span>
                      <span className="text-zinc-500">随缘供养</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>到访礼仪</span>
                      <span className="text-zinc-500">安静整洁</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>到访建议</span>
                      <span className="text-zinc-500">提前一日</span>
                    </div>
                  </div>

                  <ScriptureQuote className="mt-6" compact variant="general" />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="section pt-0 fade-in">
        <Container>
          <div className="mb-10 ink-divider" />
          <WhySection intro={SITE.intro} />
        </Container>
      </section>

      <Footer />
    </main>
  );
}
