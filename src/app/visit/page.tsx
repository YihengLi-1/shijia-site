import Link from "next/link";
import Header from "@/components/Header";
import Container from "@/components/Container";
import Footer from "@/components/Footer";
import { SITE } from "@/lib/site";
import ScriptureQuote from "@/components/ScriptureQuote";

export default function VisitPage() {
  return (
    <main className="min-h-screen text-zinc-900">
      <Header />
      <section className="section relative overflow-hidden">
        <div
          className="pointer-events-none absolute -top-10 right-6 h-48 w-48 rounded-full blur-3xl float-slow"
          style={{ background: "radial-gradient(circle, #efe7da 0%, transparent 60%)" }}
        />
        <div
          className="pointer-events-none absolute bottom-8 left-6 h-56 w-56 rounded-full blur-3xl float-slower"
          style={{ background: "radial-gradient(circle, #f2eadc 0%, transparent 60%)" }}
        />
        <div className="pointer-events-none absolute inset-0 lotus-pattern opacity-20" />
        <Container className="relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200/70 bg-white/70 px-4 py-1 text-xs font-medium text-zinc-600">
              到访
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight serif-title">路线与礼仪</h1>
            <p className="mt-3 text-sm text-zinc-600">
              提前预约更便于安排，请保持安静与整洁，让心归于清净。
            </p>

            <div className="mt-8 rounded-3xl border border-zinc-200/70 bg-white/80 p-6 shadow-sm soft-card">
              <div className="text-xs font-semibold text-zinc-500">到访须知</div>
              <p className="mt-3 text-sm text-zinc-700 leading-7">
                到访请轻声交流、尊重修行场所秩序。若迟到或需要改期，请提前联系。
              </p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-zinc-200/70 bg-white/80 p-5 soft-card">
                <div className="text-xs font-semibold text-zinc-500">停车</div>
                <div className="mt-3 text-sm text-zinc-700">
                  车位有限，请按指引停放，避免影响他人通行。
                </div>
              </div>
              <div className="rounded-2xl border border-zinc-200/70 bg-white/80 p-5 soft-card">
                <div className="text-xs font-semibold text-zinc-500">路线</div>
                <div className="mt-3 text-sm text-zinc-700">
                  请使用导航到访，入口以当天指示为准。
                </div>
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-3xl border border-zinc-200/70 bg-white/80 shadow-sm soft-card">
              <div className="relative h-44 w-full">
                <div className="absolute inset-0 bg-gradient-to-br from-stone-100 via-stone-200/60 to-stone-100" />
                <div
                  className="absolute -right-6 -top-8 h-28 w-28 opacity-40"
                  style={{ background: 'url("/lotus.svg") center/contain no-repeat' }}
                />
                <div className="absolute inset-0 border border-white/60" />
              </div>
              <div className="px-5 py-4 text-sm text-zinc-700">
                <div className="text-xs font-semibold text-zinc-500">到访示意</div>
                <div className="mt-2">实景与路线图待更新，请以现场指引为准。</div>
              </div>
            </div>

            <ScriptureQuote className="mt-6 max-w-xl" />

            <div className="mt-6">
              <Link
                className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium hover:border-zinc-400"
                href="/"
              >
                返回首页
              </Link>
              <a
                href={SITE.mapUrl}
                target="_blank"
                rel="noreferrer"
                className="ml-3 rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium hover:border-zinc-400"
              >
                导航到素食斋
              </a>
            </div>
          </div>
        </Container>
      </section>

      <Footer />
    </main>
  );
}
