import Link from "next/link";

export default function VisitPage() {
  return (
    <main className="min-h-screen bg-white text-zinc-900">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Link className="text-sm text-zinc-700 underline underline-offset-4" href="/">
          ← 返回首页
        </Link>
        <h1 className="mt-6 text-3xl font-semibold">到访</h1>
        <p className="mt-4 text-zinc-700 leading-7">
          这里放：路线、停车、到访须知（保持安静）。
        </p>
      </div>
    </main>
  );
}