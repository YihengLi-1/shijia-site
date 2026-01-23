// src/app/api/email/test/route.ts
import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

function pick(name: string) {
  const v = (process.env[name] || "").trim();
  return v ? `${v.slice(0, 6)}…${v.slice(-4)}` : "";
}

function must(name: string) {
  const v = (process.env[name] || "").trim();
  if (!v) throw new Error(`missing ${name}`);
  return v;
}

export async function POST() {
  try {
    const resendKey = must("RESEND_API_KEY");
    const from = (process.env.RESEND_FROM || "").trim(); // 你要的发件人
    const to =
      (process.env.EMAIL_TO_OVERRIDE || "").trim() ||
      (process.env.EMAIL_DEFAULT_TO || "").trim();

    if (!to) throw new Error("missing EMAIL_TO_OVERRIDE or EMAIL_DEFAULT_TO");
    if (!from) throw new Error("missing RESEND_FROM");

    const resend = new Resend(resendKey);

    const r = await resend.emails.send({
      from,
      to,
      subject: "Resend From 调试 / test",
      html: `
        <div>
          <h3>Resend debug</h3>
          <p><b>fromUsed</b>: ${from}</p>
          <p><b>toUsed</b>: ${to}</p>
          <p><b>RESEND_API_KEY</b>: ${pick("RESEND_API_KEY")}</p>
          <p><b>RESEND_FROM</b>: ${from}</p>
          <p><b>EMAIL_TO_OVERRIDE</b>: ${(process.env.EMAIL_TO_OVERRIDE || "").trim()}</p>
          <p><b>EMAIL_DEFAULT_TO</b>: ${(process.env.EMAIL_DEFAULT_TO || "").trim()}</p>
          <p><b>NODE_ENV</b>: ${process.env.NODE_ENV}</p>
        </div>
      `,
    });

    return NextResponse.json(
      {
        ok: true,
        fromUsed: from,
        toUsed: to,
        resendId: (r as any)?.data?.id ?? null,
        resendError: (r as any)?.error ?? null,
      },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json(
      {
        ok: false,
        error: String(e?.message ?? e),
        seen: {
          hasResendKey: Boolean((process.env.RESEND_API_KEY || "").trim()),
          hasResendFrom: Boolean((process.env.RESEND_FROM || "").trim()),
          hasToOverride: Boolean((process.env.EMAIL_TO_OVERRIDE || "").trim()),
          hasDefaultTo: Boolean((process.env.EMAIL_DEFAULT_TO || "").trim()),
          keyLast4: (process.env.RESEND_API_KEY || "").trim().slice(-4),
          from: (process.env.RESEND_FROM || "").trim(),
          toOverride: (process.env.EMAIL_TO_OVERRIDE || "").trim(),
          defaultTo: (process.env.EMAIL_DEFAULT_TO || "").trim(),
          nodeEnv: process.env.NODE_ENV,
        },
      },
      { status: 500 }
    );
  }
}