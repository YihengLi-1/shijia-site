import Link from "next/link";
import Header from "@/components/Header";
import Container from "@/components/Container";
import Footer from "@/components/Footer";
import ScriptureQuote from "@/components/ScriptureQuote";

export default function NotFound() {
  return (
    <main className="min-h-screen">
      <Header hideCta />

      <section className="page-content-sm fade-in">
        <Container>
          <div className="max-w-xl rise-in">
            <p className="eyebrow mb-6">· 此处已空 · Not Found ·</p>
            <h1 className="text-[clamp(3rem,10vw,6rem)] font-semibold serif-title leading-[1] tracking-[-0.03em] text-[var(--ink)]">
              404
            </h1>
            <div className="red-rule mt-5 mb-4" />
            <p className="text-[14px] font-light italic tracking-[0.04em] text-[var(--muted)] font-display mb-5">
              The page you seek has passed
            </p>
            <p className="text-[14px] text-[var(--ink-2)] leading-[1.85]">
              此页不在，或已移去。心不住相，当下即是归处。
            </p>
            <p className="mt-2 text-[12.5px] text-[var(--muted)]">
              This page could not be found. Perhaps it was never here — or perhaps it has already let go.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/"
                className="rounded-full px-6 py-2.5 text-[13px] font-semibold pressable cta-shimmer temple-cta"
              >
                返回首页 · Home
              </Link>
              <Link
                href="/menu"
                className="rounded-full border border-[var(--line)] bg-white/70 px-5 py-2.5 text-[13px] font-medium pressable temple-ghost"
              >
                前往供斋 · Dining →
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <section className="pb-20">
        <Container>
          <div className="max-w-xl">
            <ScriptureQuote compact variant="general" />
          </div>
        </Container>
      </section>

      <Footer />
    </main>
  );
}
