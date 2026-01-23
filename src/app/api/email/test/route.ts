import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

export async function POST() {
  try {
    const key = process.env.RESEND_API_KEY;
    if (!key) return NextResponse.json({ ok: false, error: "missing RESEND_API_KEY" }, { status: 500 });

    const resend = new Resend(key);

    // ⚠️ 先用你自己的邮箱测试（你改成你自己的邮箱）
    const to = "yihengli23@gmail.com";

    const r = await resend.emails.send({
      from: "Shijia <onboarding@resend.dev>",
      to,
      subject: "测试邮件：支付系统发信通路 OK",
      html: `<p>如果你收到这封邮件，说明 Resend 已配置成功 ✅</p>`,
    });

    return NextResponse.json({ ok: true, result: r });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message ?? e) }, { status: 500 });
  }
}