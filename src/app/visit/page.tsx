import Link from "next/link";
import Header from "@/components/Header";
import Container from "@/components/Container";
import Footer from "@/components/Footer";
import { SITE } from "@/lib/site";
import ScriptureQuote from "@/components/ScriptureQuote";
import ChipReveal from "@/components/ChipReveal";

export default function VisitPage() {
  return (
    <main className="min-h-screen text-zinc-900">
      <Header hideCta />
      <section className="section relative overflow-hidden fade-in temple-veil">
        <div
          className="pointer-events-none absolute -top-10 right-6 h-48 w-48 rounded-full blur-3xl opacity-30"
          style={{ background: "radial-gradient(circle, #efe7da 0%, transparent 60%)" }}
        />
        <div
          className="pointer-events-none absolute bottom-8 left-6 h-56 w-56 rounded-full blur-3xl opacity-30"
          style={{ background: "radial-gradient(circle, #f2eadc 0%, transparent 60%)" }}
        />
        <div className="pointer-events-none absolute inset-0 lotus-pattern opacity-[0.2]" />
        <Container className="relative z-10">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200/70 bg-white/70 px-4 py-1 text-xs font-medium text-zinc-600">
                到访
              </div>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight serif-title">来访须知</h1>
              <p className="mt-3 text-sm text-zinc-600">
                到访以安静为先，轻声慢行即可。
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 cta-glow pressable focus-ring"
                  href="/menu"
                >
                  前往供斋
                </Link>
                <a
                  href={SITE.mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium hover:border-zinc-400"
                >
                  导航到素食斋
                </a>
              </div>

              <div className="mt-8 rounded-3xl border border-zinc-200/70 bg-white/80 p-6 text-sm text-zinc-700 shadow-sm soft-card">
                若迟到或需改期，请提前联系管理员，以便安排座位与供斋准备。
              </div>

              <div className="mt-5 rounded-3xl border border-zinc-200/70 bg-white/80 p-5 text-sm text-zinc-700 shadow-sm soft-card">
                <div className="text-xs font-semibold text-zinc-500">简要礼仪</div>
                <div className="mt-3">
                  <ChipReveal
                    items={[
                      { label: "预约确认", note: "先确认时间，方便留席。" },
                      { label: "安静到访", note: "轻声慢行，心自安静。" },
                      { label: "缓慢用斋", note: "慢一些，味与心更清。"},
                    ]}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-3xl border border-zinc-200/70 bg-white/85 p-6 shadow-sm soft-card">
                <div className="text-xs font-semibold text-zinc-500">来访礼仪</div>
                <div className="mt-4 space-y-3 text-sm text-zinc-700">
                  <div>轻声入门，缓慢行走</div>
                  <div>尊重秩序，保持整洁</div>
                  <div>合掌感恩，安住身心</div>
                </div>
              </div>

              <div className="rounded-3xl border border-zinc-200/70 bg-white/85 p-6 shadow-sm soft-card">
                <div className="text-xs font-semibold text-zinc-500">来访信息</div>
                <div className="mt-4 space-y-3 text-sm text-zinc-700">
                  <div className="flex items-center justify-between">
                    <span>停车</span>
                    <span className="text-zinc-500">车位有限，请按指引停放</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>路线</span>
                    <span className="text-zinc-500">入口以当天指示为准</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>到访时间</span>
                    <span className="text-zinc-500">建议提前一天</span>
                  </div>
                </div>
                <div className="mt-4 text-xs text-zinc-500">请以现场指引为准，先行留席更稳妥。</div>
              </div>

              <ScriptureQuote compact variant="general" />
            </div>
          </div>
        </Container>
      </section>

      <Footer />
    </main>
  );
}
