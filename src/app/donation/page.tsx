import Link from "next/link";
import Header from "@/components/Header";
import Container from "@/components/Container";
import DonationClient from "./DonationClient";
import Footer from "@/components/Footer";
import ScriptureQuote from "@/components/ScriptureQuote";

export default function DonationPage() {
  return (
    <main className="min-h-screen text-zinc-900">
      <Header hideCta />
      <section className="section relative overflow-hidden fade-in temple-veil hall-shell">
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
        <div className="pointer-events-none absolute inset-0 lotus-pattern opacity-[0.08]" />
        <Container className="relative z-10">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <div className="max-w-3xl relative">
              <div className="hall-plaque-wrap">
                <div className="hall-plaque">
                  <span className="hall-plaque-dot" aria-hidden="true" />
                  随喜护持
                </div>
              </div>
              <h1 className="mt-4 text-[clamp(2.6rem,5vw,3.6rem)] font-semibold tracking-tight serif-title">随喜</h1>
              <p className="mt-3 text-sm text-zinc-600">
                随喜护持，香灯与供斋有您一份护持。如需核对信息，请联系管理员协助。
              </p>

              <div className="mt-6 rounded-3xl border border-zinc-200/70 bg-white/80 p-6 text-sm text-zinc-700 shadow-sm soft-card">
                随喜非为交换，只是愿意共护一处清净之所。愿此护持，回向众生安稳。
              </div>

              <ScriptureQuote className="mt-6 max-w-xl" variant="compassion" />

              <div className="mt-6 text-xs text-zinc-500">
                随喜记录将妥善保存。如需核对，请提供随喜编号，便于人工协助。
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
            </div>
          </div>
        </Container>
      </section>

      <Footer />
    </main>
  );
}
