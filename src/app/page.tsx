// src/app/page.tsx
import Link from "next/link";
import Header from "@/components/Header";
import Container from "@/components/Container";
import { SITE } from "@/lib/site";
import Footer from "@/components/Footer";
import ScriptureQuote from "@/components/ScriptureQuote";

export default function Home() {
  return (
    <main className="min-h-screen text-zinc-900">
      <Header />

      <section className="section relative overflow-hidden">
        <div
          className="pointer-events-none absolute -top-8 right-10 h-48 w-48 rounded-full blur-3xl float-slow"
          style={{ background: "radial-gradient(circle, #efe7da 0%, transparent 60%)" }}
        />
        <div
          className="pointer-events-none absolute bottom-10 left-8 h-56 w-56 rounded-full blur-3xl float-slower"
          style={{ background: "radial-gradient(circle, #f2eadc 0%, transparent 60%)" }}
        />
        <div className="pointer-events-none absolute inset-0 lotus-pattern opacity-25" />
        <Container className="relative z-10">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div className="fade-in">
              <div className="inline-flex items-center gap-3 rounded-full border border-zinc-200/70 bg-white/70 px-4 py-1 text-xs font-medium text-zinc-600">
                清净供斋 · 预约到访
              </div>

              <h1 className="mt-6 text-[clamp(2.6rem,6vw,4.5rem)] font-semibold tracking-tight">
                {SITE.name}
              </h1>

              <p className="mt-5 max-w-2xl whitespace-pre-line text-lg leading-7 text-zinc-700">
                {SITE.tagline}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/menu"
                  className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white hover:bg-zinc-800 pressable btn-glow"
                >
                  开始供斋
                </Link>

                <Link
                  href="/visit"
                  className="rounded-full border border-zinc-300 bg-white px-6 py-3 text-sm font-semibold hover:border-zinc-400 pressable"
                >
                  到访须知
                </Link>
              </div>

              <div className="mt-4 text-xs text-zinc-500">
                支付完成会发送确认邮件；如需改期或退款，可联系管理员人工处理。
              </div>

              <ScriptureQuote className="mt-8 max-w-xl" />

              <div className="mt-10 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-zinc-200/70 bg-white/80 p-5 soft-card">
                  <div className="text-xs font-semibold text-zinc-500">开放时间</div>
                  <div className="mt-2 text-sm text-zinc-800">{SITE.hours}</div>
                </div>
                <div className="rounded-2xl border border-zinc-200/70 bg-white/80 p-5 soft-card">
                  <div className="text-xs font-semibold text-zinc-500">地址</div>
                  <div className="mt-2 text-sm text-zinc-800">{SITE.address}</div>
                </div>
                <div className="rounded-2xl border border-zinc-200/70 bg-white/80 p-5 soft-card">
                  <div className="text-xs font-semibold text-zinc-500">联系</div>
                  <div className="mt-2 text-sm text-zinc-800">{SITE.contact}</div>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[30px] border border-zinc-200/70 bg-white/80 p-6 shadow-sm soft-card">
              <div
                className="absolute inset-0 opacity-90"
                style={{
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.9) 100%), url("/hero.svg") center/cover no-repeat',
                }}
              />
              <div
                className="absolute right-6 top-6 h-16 w-16 opacity-60 float-slow"
                style={{ background: 'url("/lotus.svg") center/contain no-repeat' }}
              />
              <div className="relative z-10 rounded-2xl border border-zinc-200/70 bg-white/80 p-6 soft-card">
                <div className="text-xs font-semibold text-zinc-500">今日节奏</div>
                <div className="mt-3 text-lg font-semibold text-zinc-900">安住 · 清净 · 随缘</div>
                <p className="mt-2 text-sm text-zinc-700">
                  以清净为本、以供斋为缘。请以修行场所的秩序与安静到访。
                </p>

                <div className="mt-6 space-y-3 text-sm text-zinc-700">
                  <div className="flex items-center justify-between">
                    <span>预约到访</span>
                    <span className="text-zinc-500">建议提前一天</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>到访礼仪</span>
                    <span className="text-zinc-500">保持安静与整洁</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>供斋方式</span>
                    <span className="text-zinc-500">随缘供养</span>
                  </div>
                </div>
              </div>

              <div className="relative z-10 mt-4 grid gap-3">
                <Link
                  href="/visit"
                  className="rounded-2xl border border-zinc-200 bg-white px-4 py-4 text-sm font-medium hover:border-zinc-300"
                >
                  到访须知与停车路线
                </Link>
                <Link
                  href="/veggie"
                  className="rounded-2xl border border-zinc-200 bg-white px-4 py-4 text-sm font-medium hover:border-zinc-300"
                >
                  用餐礼仪与供养说明
                </Link>
                <Link
                  href="/donation"
                  className="rounded-2xl border border-zinc-200 bg-white px-4 py-4 text-sm font-medium hover:border-zinc-300"
                >
                  随喜护持
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="section pt-0">
        <Container>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { title: "清净空间", note: "待更新实景照片" },
              { title: "当日供斋", note: "以现场为准" },
              { title: "香灯与护持", note: "随喜随缘" },
            ].map((item) => (
              <div
                key={item.title}
                className="overflow-hidden rounded-3xl border border-zinc-200/70 bg-white/80 p-4 shadow-sm soft-card"
              >
                <div className="relative h-44 w-full overflow-hidden rounded-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-stone-100 via-stone-200/60 to-stone-100" />
                  <div
                    className="absolute -right-6 -top-8 h-24 w-24 opacity-50"
                    style={{ background: 'url("/lotus.svg") center/contain no-repeat' }}
                  />
                  <div className="absolute inset-0 border border-white/60" />
                </div>
                <div className="mt-4 text-sm font-semibold text-zinc-800">{item.title}</div>
                <div className="mt-1 text-xs text-zinc-500">{item.note}</div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="section pt-0">
        <Container>
          <div className="rounded-3xl border border-zinc-200/70 bg-white/80 p-8 shadow-sm soft-card">
            <div className="text-xs font-semibold text-zinc-500">此处为何</div>
            <div className="mt-3 text-xl font-semibold text-zinc-900 serif-title">一处供斋之所，也是安住之处</div>
            <p className="mt-3 text-sm text-zinc-700 leading-7 max-w-3xl">
              {SITE.intro}
            </p>
            <div className="mt-5 text-xs text-zinc-500">
              若需改期或退款，请联系管理员人工处理，我们会为你留住一份安心。
            </div>
          </div>
        </Container>
      </section>

      <section className="section">
        <Container>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-zinc-200/70 bg-white/80 p-6 rise-in stagger-1 soft-card">
              <div className="text-xs font-semibold text-zinc-500">到访路径</div>
              <div className="mt-3 text-lg font-semibold">预约 · 安住 · 用斋</div>
              <p className="mt-2 text-sm text-zinc-700">
                流程极简，让心不必被步骤打断。
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200/70 bg-white/80 p-6 rise-in stagger-2 soft-card">
              <div className="text-xs font-semibold text-zinc-500">清净用餐</div>
              <div className="mt-3 text-lg font-semibold">慢下来 · 少一点 · 足够</div>
              <p className="mt-2 text-sm text-zinc-700">
                以清淡安住身心，不求繁复。
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200/70 bg-white/80 p-6 rise-in stagger-3 soft-card">
              <div className="text-xs font-semibold text-zinc-500">随喜护持</div>
              <div className="mt-3 text-lg font-semibold">香灯与场所维护</div>
              <p className="mt-2 text-sm text-zinc-700">
                所得皆用于供斋与环境维护。
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="section pt-0">
        <Container>
          <div className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-zinc-200/70 bg-white/80 p-8 shadow-sm md:flex-row md:items-center soft-card">
            <div>
              <div className="text-xs font-semibold text-zinc-500">静处留席</div>
              <div className="mt-2 text-xl font-semibold serif-title text-zinc-900">
                若愿来访，我们已为你预留片刻
              </div>
              <div className="mt-2 text-sm text-zinc-600">
                供斋随缘，愿此行让心更安稳。
              </div>
            </div>
            <Link
              href="/menu"
              className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white hover:bg-zinc-800 pressable btn-glow"
            >
              开始供斋
            </Link>
          </div>
        </Container>
      </section>

      <Footer />
    </main>
  );
}
