import Link from "next/link";
import Header from "@/components/Header";
import Container from "@/components/Container";
import Footer from "@/components/Footer";
import ScriptureQuote from "@/components/ScriptureQuote";
import OfferingsPanel from "@/components/OfferingsPanel";

export default function VeggiePage() {
  return (
    <main className="min-h-screen text-zinc-900">
      <Header />
      <section className="section relative overflow-hidden">
        <div
          className="pointer-events-none absolute -top-10 right-6 h-48 w-48 rounded-full blur-3xl float-slow"
          style={{ background: "radial-gradient(circle, #efe7da 0%, transparent 60%)" }}
        />
        <div
          className="pointer-events-none absolute bottom-4 left-6 h-56 w-56 rounded-full blur-3xl float-slower"
          style={{ background: "radial-gradient(circle, #f2eadc 0%, transparent 60%)" }}
        />
        <div
          className="pointer-events-none absolute left-1/2 top-8 h-40 w-40 -translate-x-1/2 opacity-60 float-slow"
          style={{ background: 'url("/lotus.svg") center/contain no-repeat' }}
        />
        <div
          className="pointer-events-none absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full blur-3xl breath"
          style={{ background: "radial-gradient(circle, rgba(233,219,197,0.6) 0%, transparent 65%)" }}
        />
        <div className="pointer-events-none absolute inset-0 lotus-pattern opacity-20" />
        <Container className="relative z-10">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200/70 bg-white/70 px-4 py-1 text-xs font-medium text-zinc-600">
                清净素食
              </div>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight serif-title">清净素斋</h1>
              <p className="mt-3 text-sm text-zinc-600">
                此处只供一餐素斋，少油少盐，少一些繁复。愿在这一餐之间，心归于静。
              </p>

              <div className="mt-8 rounded-3xl border border-zinc-200/70 bg-white/80 p-6 shadow-sm soft-card">
                <div className="text-xs font-semibold text-zinc-500">理念</div>
                <div className="mt-3 text-lg font-semibold">慈悲 · 节制 · 感恩</div>
                <p className="mt-2 text-sm text-zinc-700 leading-7">
                  菜不求繁复，只求清净与当季。用朴素的味道提醒自己慢下来，
                  记得感恩，也记得节制。
                </p>
              </div>

              <div className="mt-6 rounded-3xl border border-zinc-200/70 bg-white/80 p-6 shadow-sm soft-card">
                <div className="text-xs font-semibold text-zinc-500">一餐之间</div>
                <p className="mt-2 text-sm text-zinc-700 leading-7">
                  我们在此相遇，愿把喧嚣放下，让这一餐成为清净的片刻，
                  也让心回到当下。
                </p>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-zinc-200/70 bg-white/80 p-5 soft-card">
                  <div className="text-xs font-semibold text-zinc-500">用斋礼仪</div>
                  <div className="mt-3 text-sm text-zinc-700">
                    轻声交流 · 缓慢用斋 · 相互尊重
                  </div>
                </div>
                <div className="rounded-2xl border border-zinc-200/70 bg-white/80 p-5 soft-card">
                  <div className="text-xs font-semibold text-zinc-500">供斋说明</div>
                  <div className="mt-3 text-sm text-zinc-700">
                    随缘供养 · 皆用于供斋与场所维护
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-3xl border border-zinc-200/70 bg-white/80 p-6 shadow-sm soft-card">
                <div className="text-xs font-semibold text-zinc-500">到斋小礼</div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-4 text-sm text-zinc-700 soft-card">
                    1. 安住呼吸，轻声入座
                  </div>
                  <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-4 text-sm text-zinc-700 soft-card">
                    2. 合掌感恩，节制取用
                  </div>
                  <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-4 text-sm text-zinc-700 soft-card">
                    3. 缓慢用斋，体察身心
                  </div>
                  <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-4 text-sm text-zinc-700 soft-card">
                    4. 轻声离席，保持整洁
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 cta-glow pressable focus-ring"
                  href="/menu"
                >
                  今日供斋
                </Link>
                <Link
                  className="rounded-full border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold hover:border-zinc-400"
                  href="/visit"
                >
                  到访须知
                </Link>
                <Link
                  className="rounded-full border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold hover:border-zinc-400"
                  href="/"
                >
                  返回首页
                </Link>
              </div>
            </div>

            <div className="space-y-6">
              <OfferingsPanel />

              <aside className="rounded-3xl border border-zinc-200/70 bg-white/80 p-6 shadow-sm soft-card">
                <div className="text-xs font-semibold text-zinc-500">今日斋素</div>
                <div className="mt-3 text-lg font-semibold">简而有心</div>
                <p className="mt-2 text-sm text-zinc-700">
                  供斋以当日食材为准。味道清爽、温和，重在身心安稳。
                </p>

                <div className="mt-6 grid gap-3">
                  <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-4 text-sm text-zinc-700 soft-card">
                    时令蔬菜 · 清淡汤品 · 当日主食
                  </div>
                  <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-4 text-sm text-zinc-700 soft-card">
                    甜品与饮品 · 随缘供应
                  </div>
                  <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-4 text-sm text-zinc-700 soft-card">
                    供斋随缘 · 以当日为准
                  </div>
                </div>

              <div className="mt-6 rounded-2xl border border-zinc-200 bg-white px-4 py-4 text-sm text-zinc-700 soft-card">
                  供斋以现场为准，若需调整或退款，请联系管理员人工处理。
                </div>

                <ScriptureQuote className="mt-6" compact />
              </aside>
            </div>
          </div>
        </Container>
      </section>

      <Footer />
    </main>
  );
}
