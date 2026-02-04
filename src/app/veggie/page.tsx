import Link from "next/link";
import Header from "@/components/Header";
import Container from "@/components/Container";
import Footer from "@/components/Footer";
import ScriptureQuote from "@/components/ScriptureQuote";
import ChipReveal from "@/components/ChipReveal";

export default function VeggiePage() {
  return (
    <main className="min-h-screen text-zinc-900">
      <Header hideCta />
      <section className="section relative overflow-hidden fade-in">
        <div
          className="pointer-events-none absolute -top-10 right-6 h-48 w-48 rounded-full blur-3xl opacity-35"
          style={{ background: "radial-gradient(circle, #efe7da 0%, transparent 60%)" }}
        />
        <div
          className="pointer-events-none absolute bottom-4 left-6 h-56 w-56 rounded-full blur-3xl opacity-35"
          style={{ background: "radial-gradient(circle, #f2eadc 0%, transparent 60%)" }}
        />
        <div
          className="pointer-events-none absolute left-1/2 top-8 h-40 w-40 -translate-x-1/2 opacity-60"
          style={{ background: 'url("/lotus.svg") center/contain no-repeat' }}
        />
        <div
          className="pointer-events-none absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full blur-3xl opacity-35"
          style={{ background: "radial-gradient(circle, rgba(233,219,197,0.6) 0%, transparent 65%)" }}
        />
        <div className="pointer-events-none absolute inset-0 lotus-pattern opacity-[0.12]" />
        <Container className="relative z-10">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200/70 bg-white/70 px-4 py-1 text-xs font-medium text-zinc-600">
                清净素食
              </div>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight serif-title">清净素斋</h1>
              <p className="mt-3 text-sm text-zinc-600">
                这里不是菜单，而是一餐清净之缘。少油少盐，不求繁复，只求安住与感恩。
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-zinc-200/70 bg-white/80 p-5 shadow-sm soft-card">
                  <div className="text-xs font-semibold text-zinc-500">清淡之味</div>
                  <p className="mt-3 text-sm text-zinc-700 leading-7">
                    取当季之食，味淡而不寡，清净而有度。
                  </p>
                </div>
                <div className="rounded-3xl border border-zinc-200/70 bg-white/80 p-5 shadow-sm soft-card">
                  <div className="text-xs font-semibold text-zinc-500">缓慢用斋</div>
                  <p className="mt-3 text-sm text-zinc-700 leading-7">
                    慢一些、少一些、足够即可，让心念回到当下。
                  </p>
                </div>
                <div className="rounded-3xl border border-zinc-200/70 bg-white/80 p-5 shadow-sm soft-card sm:col-span-2">
                  <div className="text-xs font-semibold text-zinc-500">感恩供养</div>
                  <p className="mt-3 text-sm text-zinc-700 leading-7">
                    念食材、念供养、念众缘。愿一餐之缘，成为修行之缘。
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <ChipReveal
                  items={[
                    { label: "少欲", note: "少欲则心轻，味也轻。" },
                    { label: "知足", note: "一餐足矣，心不多求。" },
                    { label: "感恩", note: "念众缘与供养，心自安。" },
                  ]}
                />
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 cta-glow pressable focus-ring"
                  href="/menu"
                >
                  查看今日供斋
                </Link>
                <Link
                  className="text-sm font-semibold text-zinc-600 hover:text-zinc-900"
                  href="/visit"
                >
                  到访礼序 →
                </Link>
              </div>
            </div>

            <div className="space-y-6">
              <aside className="rounded-3xl border border-zinc-200/70 bg-white/80 p-6 shadow-sm soft-card hover-scale">
                <div className="text-xs font-semibold text-zinc-500">斋前一念</div>
                <p className="mt-3 text-sm text-zinc-700 leading-7">
                  合掌静心，愿此一餐成为修行之缘，愿身心安稳、念念清净。
                </p>

                <div className="mt-6 grid gap-3 text-sm text-zinc-700">
                  <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3">
                    当季时蔬 · 清淡汤品 · 当日主食
                  </div>
                  <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3">
                    甜品与饮品 · 随缘供应
                  </div>
                  <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3">
                    清简为主 · 量足即可
                  </div>
                </div>

                <ScriptureQuote className="mt-6" compact variant="meal" />
              </aside>
            </div>
          </div>
        </Container>
      </section>

      <Footer />
    </main>
  );
}
