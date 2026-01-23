// src/app/api/email/paid/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getResend, getFrom, getTo, requireEnv } from "@/lib/resend";

export const runtime = "nodejs";

function supabaseAdmin() {
  const url = requireEnv("SUPABASE_URL");
  const key = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(req: Request) {
  try {
    const { orderId } = (await req.json().catch(() => ({}))) as { orderId?: string };
    if (!orderId) {
      return NextResponse.json({ ok: false, error: "missing_orderId" }, { status: 400 });
    }

    const supabase = supabaseAdmin();
    const { data: order, error } = await supabase
      .from("orders")
      .select("id, status, booking_id, amount_cents, currency")
      .eq("id", orderId)
      .single();

    if (error || !order) {
      return NextResponse.json({ ok: false, error: "order_not_found", detail: error?.message }, { status: 404 });
    }

    if (String((order as any).status) !== "paid") {
      return NextResponse.json({ ok: true, skipped: true, reason: "not_paid" }, { status: 200 });
    }

    const amount = Number((order as any).amount_cents ?? 0) / 100;
    const currency = String((order as any).currency ?? "usd").toUpperCase();
    const reference = orderId.slice(0, 8) + "…" + orderId.slice(-6);

    const { resend, key } = getResend();
    const from = getFrom();
    const to = getTo();

    const html = `
      <div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial;line-height:1.6;color:#111">
        <h2 style="margin:0 0 12px;font-weight:600">付款已确认 ✅</h2>
        <p style="margin:0 0 18px">我们已成功收到您的付款，预约已记录。</p>

        <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:12px 0">
          <tr><td style="padding:6px 16px 6px 0;color:#666">参考号</td><td style="padding:6px 0">${reference}</td></tr>
          <tr><td style="padding:6px 16px 6px 0;color:#666">预约号</td><td style="padding:6px 0">${(order as any).booking_id ?? ""}</td></tr>
          <tr><td style="padding:6px 16px 6px 0;color:#666">金额</td><td style="padding:6px 0">${amount.toFixed(2)} ${currency}</td></tr>
        </table>

        <p style="margin:18px 0 0;color:#555">如需修改时间或人数，请回到预约页面重新提交（以最新一条为准）。</p>
        <p style="margin:24px 0 0;color:#888;font-size:13px">此邮件用于确认付款状态，请妥善保存。</p>
      </div>
    `;

    const r = await resend.emails.send({
      from,
      to,
      subject: "付款已确认｜预约已记录",
      html,
    });

    return NextResponse.json({
      ok: true,
      sent: true,
      fromUsed: from,
      toUsed: to,
      resendKeyLast4: key.slice(-4),
      resendResponse: r,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message ?? e) }, { status: 500 });
  }
}