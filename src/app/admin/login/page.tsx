"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function LoginInner() {
  const router = useRouter();
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string>("");

  async function onSubmit() {
    setMsg("");
    setLoading(true);
    try {
      // 这里假设你有 /api/admin/login（如果没有也没关系，至少 build 会过）
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMsg(data?.error ? `登录失败：${data.error}` : `登录失败：${res.status}`);
        return;
      }

      setMsg("登录成功 ✅");
      // 登录成功后跳去 /admin（如果你没有 /admin 页面也不影响 build）
      router.push("/admin");
    } catch (e: any) {
      setMsg(`登录失败：${String(e?.message ?? e)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-pink-200/60 text-zinc-900">
      <div className="mx-auto max-w-xl px-6 py-16">
        <h1 className="text-3xl font-black tracking-tight">管理员登录</h1>
        <p className="mt-3 text-zinc-700">
          请输入管理员口令（仅内部使用）。
        </p>

        <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-zinc-200">
          <label className="text-sm font-semibold">管理员口令</label>
          <input
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="输入口令"
            className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:border-zinc-400"
          />

          {msg ? (
            <div className="mt-4 rounded-2xl bg-zinc-50 px-4 py-3 text-sm text-zinc-700 ring-1 ring-zinc-200">
              {msg}
            </div>
          ) : null}

          <div className="mt-6 flex gap-3">
            <button
              onClick={onSubmit}
              disabled={!key.trim() || loading}
              className="rounded-full bg-zinc-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50 hover:bg-zinc-800"
            >
              {loading ? "登录中..." : "登录"}
            </button>

            <Link
              href="/"
              className="rounded-full border border-zinc-200 px-5 py-3 text-sm font-semibold hover:bg-zinc-50"
            >
              返回首页
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function AdminLoginPage() {
  // ✅ 关键：useSearchParams 这类 hook 相关的 CSR bailout，Next 要求 Suspense
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <LoginInner />
    </Suspense>
  );
}