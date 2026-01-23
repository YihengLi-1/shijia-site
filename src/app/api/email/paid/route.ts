import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export const runtime = "nodejs";

function supabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("missing supabase env");
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(req: Request) {
  try {
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) throw new Error("missing RESEND_API_KEY");

    const { orderId } = (await req.json()) as { orderId?: string };
    if (!orderId) {
      return NextResponse.json({ ok: false, error: "missing_orderId" }, { status: 400 });
    }

    const supabase = supabaseAdmin();

    const { data: order } = await supabase
      .from("orders")
      .select("id, status, booking_id, amount_cents, currency")
      .eq("id", orderId)
      .single();

    if (!order || order.status !== "paid") {
      return NextResponse.json({ ok: true, skipped: true, reason: "not_paid" });
    }

    const amount =
      Number(order.amount_cents ?? 0) / 100;
    const currency =
      String(order.currency ?? "usd").toUpperCase();

    const reference =
      orderId.slice(0, 8) + "…" + orderId.slice(-6);

    const resend = new Resend(resendKey);

    const html = `
<div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial;line-height:1.6;color:#111">
  <h2 style="margin:0 0 12px;font-weight:600">付款已确认 ✅</h2>

  <p style="margin:0 0 18px">
    我们已成功收到您的付款，预约已记录。
  </p>

  <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:12px 0">
    <tr>
      <td style="padding:6px 16px 6px 0;color:#666">参考号</td>
      <td style="padding:6px 0">${reference}</td>
    </tr>
    <tr>
      <td style="padding:6px 16px 6px 0;color:#666">预约号</td>
      <td style="padding:6px 0">${order.booking_id ?? ""}</td>
    </tr>
    <tr>
      <td style="padding:6px 16px 6px 0;color:#666">金额</td>
      <td style="padding:6px 0">${amount.toFixed(2)} ${currency}</td>
    </tr>
  </table>

  <p style="margin:18px 0 0;color:#555">
    如需修改时间或人数，请回到预约页面重新提交（以最新一条为准）。
  </p>

  <p style="margin:24px 0 0;color:#888;font-size:13px">
    此邮件用于确认付款状态，请妥善保存。
  </p>
</div>
`;

    const result = await resend.emails.send({
      from: "Shijia <onboarding@resend.dev>",
      to: "yihengli23@gmail.com",
      subject: "付款已确认｜预约已记录",
      html,
    });

    return NextResponse.json({ ok: true, sent: true, result });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}