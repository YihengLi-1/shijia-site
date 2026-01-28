// src/app/page.tsx
import Link from "next/link";
import Header from "@/components/Header";
import Container from "@/components/Container";
import { SITE } from "@/lib/site";

export default function Home() {
  return (
    <main className="min-h-screen bg-pink-200/60 text-zinc-900">
      <Header />

      <section className="py-16">
        <Container>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            {SITE.name}
          </h1>

          <p className="mt-6 max-w-2xl whitespace-pre-line text-lg leading-7 text-zinc-700">
            {SITE.tagline}
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {/* Left */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6">
              <div className="text-sm font-semibold text-zinc-900">地址</div>
              <div className="mt-2 text-zinc-700">{SITE.address}</div>

              <div className="mt-6 text-sm font-semibold text-zinc-900">
                开放时间
              </div>
              <div className="mt-2 text-zinc-700">{SITE.hours}</div>

              <div className="mt-6 text-sm font-semibold text-zinc-900">联系</div>

              <div className="mt-2 flex flex-wrap items-center gap-3 text-zinc-700">
                <span className="text-sm">{SITE.contact}</span>

                <a
                  href={`tel:${SITE.phone}`}
                  className="rounded-full border border-zinc-300 bg-white px-3 py-1 text-sm font-medium hover:border-zinc-400"
                >
                  一键拨号
                </a>

                <a
                  href={`mailto:${SITE.email}`}
                  className="rounded-full border border-zinc-300 bg-white px-3 py-1 text-sm font-medium hover:border-zinc-400"
                >
                  发邮件
                </a>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={SITE.mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
                >
                  导航到素食斋
                </a>

                <Link
                  href="/book"
                  className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium hover:border-zinc-400"
                >
                  预约时间
                </Link>
              </div>

              {/* Booking notice */}
              <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <div className="text-sm font-semibold text-zinc-900">
                  预约须知
                </div>

                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-700">
                  <li>建议到访前预约，便于安排座位与准备。</li>
                  <li>若迟到请提前联系；未联系可能无法保留座位。</li>
                  <li>请保持安静与整洁，尊重修行场所秩序。</li>
                </ul>

                <div className="mt-3 text-xs text-zinc-500">
                  改期或取消请通过电话或邮件联系。
                </div>
              </div>
            </div>

            {/* Right */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6">
              <div className="text-sm font-semibold text-zinc-900">快速入口</div>

              <p className="mt-2 text-zinc-700">
                素食斋为主，寺庙为背景：对外开放，但保持修行秩序。
              </p>

              <div className="mt-6 grid gap-4">
                {/* ✅ 菜单入口：只做入口，不显示菜 */}
                <Link
                  href="/menu"
                  className="rounded-2xl border border-zinc-200 p-4 hover:border-zinc-300"
                >
                  <div className="font-semibold">菜单</div>
                  <div className="mt-1 text-sm text-zinc-600">
                    查看今日/常备菜品（后续可加图片）
                  </div>
                </Link>

                <Link
                  href="/veggie"
                  className="rounded-2xl border border-zinc-200 p-4 hover:border-zinc-300"
                >
                  <div className="font-semibold">素食斋</div>
                  <div className="mt-1 text-sm text-zinc-600">
                    清净素食、随缘供养、用餐礼仪
                  </div>
                </Link>

                <Link
                  href="/visit"
                  className="rounded-2xl border border-zinc-200 p-4 hover:border-zinc-300"
                >
                  <div className="font-semibold">到访</div>
                  <div className="mt-1 text-sm text-zinc-600">
                    路线、停车与到访须知
                  </div>
                </Link>

                <Link
                  href="/donation"
                  className="rounded-2xl border border-zinc-200 p-4 hover:border-zinc-300"
                >
                  <div className="font-semibold">随喜</div>
                  <div className="mt-1 text-sm text-zinc-600">
                    香灯供养与环境维护
                  </div>
                </Link>

                <Link
                  href="/book"
                  className="rounded-2xl border border-zinc-200 p-4 hover:border-zinc-300"
                >
                  <div className="font-semibold">预约</div>
                  <div className="mt-1 text-sm text-zinc-600">
                    选择日期、时间、人数
                  </div>
                </Link>
              </div>

              <div className="mt-8 text-sm text-zinc-500">
                © 2026 {SITE.name}
              </div>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}