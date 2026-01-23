// src/app/api/email/test/route.ts
import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

function must(name: string) {
  const v = (process.env[name] || "").trim();
  if (!v) throw new Error(`missing ${name}`);
  return v;
}

export async function POST(req: Request) {
  try {
    const adminKey = must("ADMIN_KEY"); // 你已有的后台 key
    const body = (await req.json().catch(() => ({}))) as { key?: string };
    if ((body.key || "").trim() !== adminKey) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }

    const resendKey = must("RESEND_API_KEY");
    const from = must("RESEND_FROM");
    const to =
      (process.env.EMAIL_TO_OVERRIDE || "").trim() ||
      (process.env.EMAIL_DEFAULT_TO || "").trim();

    if (!to) throw new Error("missing EMAIL_TO_OVERRIDE or EMAIL_DEFAULT_TO");

    const resend = new Resend(resendKey);
    const r = await resend.emails.send({
      from,
      to,
      subject: "Resend locked test",
      html: "<p>OK</p>",
    });

    return NextResponse.json({ ok: true, id: (r as any)?.data?.id ?? null });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message ?? e) }, { status: 500 });
  }
}