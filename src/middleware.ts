import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: ["/admin/:path*"],
};

export function middleware(req: NextRequest) {
  const adminKey = process.env.ADMIN_KEY;

  // ✅ 1. 放行 login 页面（关键！不然必死循环）
  if (req.nextUrl.pathname === "/admin/login") {
    return NextResponse.next();
  }

  // ✅ 2. 仅开发环境允许未配置 ADMIN_KEY 直接放行
  if (!adminKey && process.env.NODE_ENV !== "production") {
    return NextResponse.next();
  }

  // 生产环境必须配置 ADMIN_KEY
  if (!adminKey && process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { ok: false, error: "admin_key_not_configured" },
      { status: 503 }
    );
  }

  // ✅ 3. 校验 cookie
  const cookieKey = req.cookies.get("admin_key")?.value;

  if (cookieKey === adminKey) {
    return NextResponse.next();
  }

  // ❌ 4. 未登录 → 跳转到 login
  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  url.searchParams.set("next", req.nextUrl.pathname);

  return NextResponse.redirect(url);
}
