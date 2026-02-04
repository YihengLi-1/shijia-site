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
      <section className="section relative overflow-hidden">
        <div
          className="pointer-events-none absolute -top-12 right-6 h-48 w-48 rounded-full blur-3xl float-slow"
          style={{ background: "radial-gradient(circle, #efe7da 0%, transparent 60%)" }}
        />
        <div
          className="pointer-events-none absolute bottom-6 left-8 h-56 w-56 rounded-full blur-3xl float-slower"
          style={{ background: "radial-gradient(circle, #f2eadc 0%, transparent 60%)" }}
        />
        <div
          className="pointer-events-none absolute left-1/2 top-10 h-40 w-40 -translate-x-1/2 opacity-60 float-slow"
          style={{ background: 'url("/lotus.svg") center/contain no-repeat' }}
        />
        <div className="pointer-events-none absolute inset-0 lotus-pattern opacity-25" />
        <Container className="relative z-10">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200/70 bg-white/70 px-4 py-1 text-xs font-medium text-zinc-600">
                随喜护持
              </div>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight serif-title">随喜</h1>
              <p className="mt-3 text-sm text-zinc-600">
                供养随缘，所得用于香灯、供斋与场所维护。退款由管理员人工处理。
              </p>

              <div className="mt-8 rounded-3xl border border-zinc-200/70 bg-white/80 p-6 shadow-sm">
                <p className="text-sm text-zinc-700 leading-7">
                  随喜护持皆用于供斋与场所维护。若有退款需求，请联系管理员人工处理。
                  愿此功德，回向一切众生。
                </p>
              </div>

              <ScriptureQuote className="mt-6 max-w-xl" />

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {[
                  { title: "香灯与护持", note: "随喜随缘" },
                  { title: "供斋所需", note: "以当日为准" },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="overflow-hidden rounded-3xl border border-zinc-200/70 bg-white/80 p-4 shadow-sm"
                  >
                    <div className="relative h-28 w-full overflow-hidden rounded-2xl">
                      <div className="absolute inset-0 bg-gradient-to-br from-stone-100 via-stone-200/60 to-stone-100" />
                      <div
                        className="absolute -right-4 -top-6 h-20 w-20 opacity-40"
                        style={{ background: 'url("/lotus.svg") center/contain no-repeat' }}
                      />
                      <div className="absolute inset-0 border border-white/60" />
                    </div>
                    <div className="mt-3 text-sm font-semibold text-zinc-800">{item.title}</div>
                    <div className="mt-1 text-xs text-zinc-500">{item.note}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <Link
                  className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium hover:border-zinc-400"
                  href="/"
                >
                  返回首页
                </Link>
              </div>
            </div>

            <DonationClient />
          </div>
        </Container>
      </section>

      <Footer />
    </main>
  );
}
