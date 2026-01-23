// src/app/admin/login/page.tsx
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  async function loginAction(formData: FormData) {
    "use server";

    const input = String(formData.get("key") ?? "").trim();
    const adminKey = process.env.ADMIN_KEY || "";

    if (!adminKey) {
      // 生产环境没配 ADMIN_KEY，直接不让进
      return;
    }

    if (input !== adminKey) {
      // key 不对就停留在本页（不给你报大错，避免暴露）
      return;
    }

    // 写 cookie，后面你 middleware/服务端页面可用它做鉴权
    const cookieStore = await cookies();
cookieStore.set("admin_key", input, {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
});
    redirect("/admin/orders");
  }

  return (
    <div className="mx-auto max-w-md px-6 py-14">
      <h1 className="text-2xl font-semibold">管理员登录</h1>
      <p className="mt-2 text-sm text-zinc-600">
        请输入管理员密钥后进入后台。
      </p>

      <form action={loginAction} className="mt-6 space-y-3">
        <input
          name="key"
          type="password"
          placeholder="ADMIN_KEY"
          className="w-full rounded border px-3 py-2 text-sm"
          autoComplete="off"
        />
        <button
          type="submit"
          className="w-full rounded bg-black px-4 py-2 text-white text-sm"
        >
          登录
        </button>
      </form>

      <p className="mt-4 text-xs text-zinc-500">
        注：这是给生产环境过 build + 基础后台入口用的。后续我们再把后台做成更像“苹果级”体验。
      </p>
    </div>
  );
}