import Link from "next/link";
import Header from "@/components/Header";
import Container from "@/components/Container";
import DonationClient from "./DonationClient";
import Footer from "@/components/Footer";
import ScriptureQuote from "@/components/ScriptureQuote";

export default function DonationPage() {
  return (
    <main className="min-h-screen text-zinc-900">
      <Header />
      <section className="section relative overflow-hidden fade-in">
        <div
          className="pointer-events-none absolute -top-12 right-6 h-48 w-48 rounded-full blur-3xl opacity-35"
          style={{ background: "radial-gradient(circle, #efe7da 0%, transparent 60%)" }}
        />
        <div
          className="pointer-events-none absolute bottom-6 left-8 h-56 w-56 rounded-full blur-3xl opacity-35"
          style={{ background: "radial-gradient(circle, #f2eadc 0%, transparent 60%)" }}
        />
        <div
          className="pointer-events-none absolute left-1/2 top-10 h-40 w-40 -translate-x-1/2 opacity-60"
          style={{ background: 'url("/lotus.svg") center/contain no-repeat' }}
        />
        <div className="pointer-events-none absolute inset-0 lotus-pattern opacity-[0.12]" />
        <Container className="relative z-10">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <div className="max-w-3xl relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200/70 bg-white/70 px-4 py-1 text-xs font-medium text-zinc-600">
                随喜护持
              </div>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight serif-title">随喜</h1>
              <p className="mt-3 text-sm text-zinc-600">
                随喜随缘，所得用于香灯、供斋与场所维护。若需核对或退款，请联系管理员协助。
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-zinc-200/70 bg-white/80 p-6 shadow-sm soft-card">
                  <div className="text-xs font-semibold text-zinc-500">护持之意</div>
                  <p className="mt-3 text-sm text-zinc-700 leading-7">
                    随喜非为交换，只是愿意共护一处清净之所。功德回向，愿众生安稳。
                  </p>
                </div>
                <div className="rounded-3xl border border-zinc-200/70 bg-white/80 p-6 shadow-sm soft-card">
                  <div className="text-xs font-semibold text-zinc-500">护持用途</div>
                  <div className="mt-3 space-y-2 text-sm text-zinc-700">
                    <div>香灯与供斋所需</div>
                    <div>场所维护与清净布置</div>
                    <div>随缘供养，量力而行</div>
                  </div>
                </div>
              </div>

              <ScriptureQuote className="mt-6 max-w-xl" variant="compassion" />

              <div className="mt-6 rounded-3xl border border-zinc-200/70 bg-white/80 p-6 text-sm text-zinc-700 shadow-sm soft-card sutra-block">
                <div className="text-xs font-semibold text-zinc-500">回向偈</div>
                <p className="mt-3 leading-7">
                  愿以此功德，庄严佛净土；上报四重恩，下济三途苦。
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium hover:border-zinc-400"
                  href="/"
                >
                  返回首页
                </Link>
                <Link
                  className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium hover:border-zinc-400"
                  href="/menu"
                >
                  前往供斋
                </Link>
              </div>
            </div>

            <div className="space-y-6">
              <DonationClient />

              <div className="rounded-3xl border border-zinc-200/70 bg-white/80 p-6 shadow-sm soft-card">
                <div className="text-xs font-semibold text-zinc-500">随喜之后</div>
                <p className="mt-3 text-sm text-zinc-700 leading-7">
                  我们会妥善记录护持信息。如需核对或退款，请提供随喜编号，便于人工协助。
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <Footer />
    </main>
  );
}
