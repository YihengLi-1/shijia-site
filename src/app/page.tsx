import Link from "next/link";

export default function Home() {
  const siteName = "释迦佛国素食斋";
  const address = "1820 Sharpless Dr, La Habra Heights, CA 90631";
  const hours = "周一至周日 5:00 AM — 9:00 PM";
  const mapsUrl =
    "https://www.google.com/maps/search/?api=1&query=1820+Sharpless+Dr,+La+Habra+Heights,+CA+90631";

  return (
    <main className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-zinc-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <Link href="/" className="text-sm font-semibold tracking-wide">
            {siteName}
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-zinc-700 md:flex">
            <Link className="hover:text-zinc-900" href="/veggie">素食斋</Link>
            <Link className="hover:text-zinc-900" href="/visit">到访</Link>
            <Link className="hover:text-zinc-900" href="/donation">随喜</Link>
          </nav>

          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium hover:border-zinc-400"
          >
            导航
          </a>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-14">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{siteName}</h1>
        <p className="mt-6 max-w-2xl text-lg leading-7 text-zinc-700">
          一个对外开放的寺庙素食空间。<br />
          请以修行场所的秩序与安静来访。
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="text-sm font-semibold text-zinc-900">地址</div>
            <div className="mt-2 text-zinc-700">{address}</div>

            <div className="mt-6 text-sm font-semibold text-zinc-900">开放时间</div>
            <div className="mt-2 text-zinc-700">{hours}</div>

            <div className="mt-6 text-sm font-semibold text-zinc-900">联系</div>
            <div className="mt-2 text-zinc-700">暂定</div>

            <div className="mt-6 flex gap-3">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:opacity-90"
              >
                导航到素食斋
              </a>
              <Link
                href="/visit"
                className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium hover:border-zinc-400"
              >
                了解如何到访
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="text-sm font-semibold text-zinc-900">快速入口</div>
            <p className="mt-2 text-zinc-700">
              素食斋为主，寺庙为背景：对外开放，但保持修行秩序。
            </p>

            <div className="mt-6 grid gap-3">
              <Link className="rounded-xl border border-zinc-200 p-4 hover:border-zinc-300" href="/veggie">
                <div className="font-semibold">素食斋</div>
                <div className="mt-1 text-sm text-zinc-600">清净素食、随缘供养、用餐礼仪</div>
              </Link>

              <Link className="rounded-xl border border-zinc-200 p-4 hover:border-zinc-300" href="/visit">
                <div className="font-semibold">到访</div>
                <div className="mt-1 text-sm text-zinc-600">路线、停车与到访须知（保持安静）</div>
              </Link>

              <Link className="rounded-xl border border-zinc-200 p-4 hover:border-zinc-300" href="/donation">
                <div className="font-semibold">随喜</div>
                <div className="mt-1 text-sm text-zinc-600">用于香灯供养与环境维护</div>
              </Link>
            </div>

            <div className="mt-8 text-sm text-zinc-500">© 2026 释迦佛国素食斋</div>
          </div>
        </div>
      </section>
    </main>
  );
}