// src/app/api/email/booking-confirm/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export const runtime = "nodejs";

function supabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(req: Request) {
  try {
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      return NextResponse.json({ ok: false, error: "missing_env", detail: "RESEND_API_KEY" }, { status: 500 });
    }

    const body = (await req.json().catch(() => null)) as { orderId?: string } | null;
    const orderId = body?.orderId ? String(body.orderId) : "";
    if (!orderId) {
      return NextResponse.json({ ok: false, error: "missing_orderId" }, { status: 400 });
    }

    const supabase = supabaseAdmin();
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("id, status, booking_id, name, phone, visit_date, visit_time, party_size, amount_cents, currency")
      .eq("id", orderId)
      .single();

    if (orderErr || !order) {
      return NextResponse.json(
        { ok: false, error: "order_not_found", detail: orderErr?.message },
        { status: 404 }
      );
    }

    // ✅ 只对 paid 发邮件
    if (String((order as any).status) !== "paid") {
      return NextResponse.json({ ok: true, skipped: true, reason: "not_paid" }, { status: 200 });
    }

    // ✅ 收件人策略：
    // 1) EMAIL_TO_OVERRIDE 有值 → 强制发到这个邮箱（调试/上线早期推荐）
    // 2) 否则用 EMAIL_DEFAULT_TO（你自己填一个默认收件邮箱）
    const toOverride = (process.env.EMAIL_TO_OVERRIDE || "").trim();
    const defaultTo = (process.env.EMAIL_DEFAULT_TO || "").trim();
    const to = toOverride || defaultTo;

    if (!to) {
      return NextResponse.json(
        { ok: false, error: "missing_email_to", detail: "set EMAIL_TO_OVERRIDE or EMAIL_DEFAULT_TO" },
        { status: 500 }
      );
    }

    const from = (process.env.RESEND_FROM || "Shijia <onboarding@resend.dev>").trim();

    const amount = Number((order as any).amount_cents ?? 0) / 100;
    const currency = String((order as any).currency ?? "usd").toUpperCase();

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial; line-height:1.6">
        <h2 style="margin:0 0 12px">预约支付已确认 ✅</h2>
        <p style="margin:0 0 18px">我们已收到付款，预约已记录。</p>

        <table cellpadding="0" cellspacing="0" style="border-collapse:collapse">
          <tr><td style="padding:6px 12px 6px 0; color:#666">订单号</td><td style="padding:6px 0">${orderId}</td></tr>
          <tr><td style="padding:6px 12px 6px 0; color:#666">预约号</td><td style="padding:6px 0">${String((order as any).booking_id ?? "")}</td></tr>
          <tr><td style="padding:6px 12px 6px 0; color:#666">姓名</td><td style="padding:6px 0">${String((order as any).name ?? "")}</td></tr>
          <tr><td style="padding:6px 12px 6px 0; color:#666">电话</td><td style="padding:6px 0">${String((order as any).phone ?? "")}</td></tr>
          <tr><td style="padding:6px 12px 6px 0; color:#666">日期</td><td style="padding:6px 0">${String((order as any).visit_date ?? "")}</td></tr>
          <tr><td style="padding:6px 12px 6px 0; color:#666">时间</td><td style="padding:6px 0">${String((order as any).visit_time ?? "")}</td></tr>
          <tr><td style="padding:6px 12px 6px 0; color:#666">人数</td><td style="padding:6px 0">${String((order as any).party_size ?? "")}</td></tr>
          <tr><td style="padding:6px 12px 6px 0; color:#666">金额</td><td style="padding:6px 0">${amount.toFixed(2)} ${currency}</td></tr>
        </table>

        <p style="margin:18px 0 0; color:#666; font-size:13px">
          如需改时间/人数，请回到预约页重新提交（以最新一条为准）。
        </p>
      </div>
    `;

    const resend = new Resend(resendKey);
    const r = await resend.emails.send({
      from,
      to,
      subject: "支付已确认｜预约已记录",
      html,
    });

    return NextResponse.json({ ok: true, sent: true, to, resendId: (r as any)?.data?.id ?? null }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: "server_error", detail: String(e?.message ?? e) }, { status: 500 });
  }
}