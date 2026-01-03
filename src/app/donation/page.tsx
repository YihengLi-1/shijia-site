import Link from "next/link";

export default function DonationPage() {
  return (
    <main className="min-h-screen bg-white text-zinc-900">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Link className="text-sm text-zinc-700 underline underline-offset-4" href="/">
          ← 返回首页
        </Link>
        <h1 className="mt-6 text-3xl font-semibold">随喜</h1>
        <p className="mt-4 text-zinc-700 leading-7">
          这里放：随喜护持方式、用途说明、感谢。
        </p>
      </div>
    </main>
  );
}