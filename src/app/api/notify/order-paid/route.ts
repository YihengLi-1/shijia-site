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

function resendClient() {
  const k = process.env.RESEND_API_KEY;
  if (!k) throw new Error("missing RESEND_API_KEY");
  return new Resend(k);
}

function fromEmail() {
  const from = process.env.RESEND_FROM;
  if (!from) throw new Error("missing RESEND_FROM");
  return from;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const orderId = String(body?.orderId || "");
    if (!orderId) return NextResponse.json({ error: "missing_orderId" }, { status: 400 });

    const supabase = supabaseAdmin();

    // ✅ 读订单：需要 email / amount / status
    const { data: order, error } = await supabase
      .from("orders")
      .select("id, status, amount_cents, currency, email")
      .eq("id", orderId)
      .single();

    if (error || !order) return NextResponse.json({ error: "order_not_found" }, { status: 404 });
    if (!order.email) return NextResponse.json({ ok: true, skipped: true, reason: "no_email" });

    // ✅ 只在 paid 时发（避免误发）
    if (String(order.status) !== "paid") {
      return NextResponse.json({ ok: true, skipped: true, reason: "not_paid", status: order.status });
    }

    const resend = resendClient();

    const refShort = String(order.id).slice(0, 8);
    const amount = Number(order.amount_cents ?? 0) / 100;
    const currency = String(order.currency ?? "usd").toUpperCase();

    const subject = `预约已确认 · 释迦佛国素食斋`;

    const text = `您好，

我们已确认收到您的付款，您的预约已经记录。

参考号：${refShort}
金额：${amount.toFixed(2)} ${currency}

如需修改时间或人数，请返回预约页面重新提交（以最新一次为准）。
到访前请查看「到访须知」。

期待您的到来。
释迦佛国素食斋
`;

    const { error: sendErr } = await resend.emails.send({
      from: fromEmail(),
      to: [String(order.email)],
      subject,
      text,
    });

    if (sendErr) {
      return NextResponse.json({ error: "send_failed", detail: String(sendErr?.message || sendErr) }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: "server_error", detail: String(e?.message ?? e) }, { status: 500 });
  }
}