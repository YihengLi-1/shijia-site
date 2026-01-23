// src/app/api/email/test/route.ts
import { NextResponse } from "next/server";
import { getResend, getFrom, getTo } from "@/lib/resend";

export const runtime = "nodejs";

async function sendTest() {
  const { resend, key } = getResend();
  const from = getFrom();
  const to = getTo();

  const r = await resend.emails.send({
    from,
    to,
    subject: "【测试】RESEND_FROM 生效验证",
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial;line-height:1.6">
        <h3>RESEND_FROM 生效验证 ✅</h3>
        <p>请看邮件 From 是否为你设置的域名。</p>
      </div>
    `,
  });

  return NextResponse.json({
    ok: true,
    fromUsed: from,
    toUsed: to,
    resendKeyLast4: key.slice(-4),
    resendResponse: r,
  });
}

export async function GET() {
  try {
    return await sendTest();
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}

export async function POST() {
  return GET();
}