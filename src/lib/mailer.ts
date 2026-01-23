// src/lib/mailer.ts
import { Resend } from "resend";
import { supabaseAdmin, requireEnv } from "@/lib/supabaseAdmin";

export type EmailType = "paid";

function getResend() {
  const key = requireEnv("RESEND_API_KEY");
  return { resend: new Resend(key), key };
}

function getFrom() {
  // 例如： Shijia <no-reply@shijiafoguo.com>
  return requireEnv("RESEND_FROM");
}

/**
 * 收件人策略（生产建议）：
 * - EMAIL_TO_OVERRIDE 有值：强制发到这个邮箱（上线早期/测试期防误发）
 * - 否则发给 customerEmail（真实客户）
 */
function resolveTo(customerEmail?: string | null) {
  const override = (process.env.EMAIL_TO_OVERRIDE || "").trim();
  if (override) return override;

  const email = (customerEmail || "").trim();
  if (!email) throw new Error("missing customer email (set EMAIL_TO_OVERRIDE or orders.customer_email)");
  return email;
}

export async function sendPaidEmail(params: {
  orderId: string;
  bookingId?: string | null;
  amountCents?: number | null;
  currency?: string | null;
  customerEmail?: string | null;
}) {
  const orderId = params.orderId.trim();
  if (!orderId) throw new Error("missing orderId");

  const from = getFrom();
  const to = resolveTo(params.customerEmail);

  const sb = supabaseAdmin();

  // 幂等：先抢占 email_events（unique(type, order_id)）
  const { data: inserted, error: insErr } = await sb
    .from("email_events")
    .insert({
      type: "paid",
      order_id: orderId,
      to_email: to,
      from_email: from,
    })
    .select("id")
    .single();

  // 如果已经有记录，说明发过了，直接返回
  if (insErr) {
    return { ok: true, skipped: true, reason: "already_sent" as const };
  }

  const amount = Number(params.amountCents ?? 0) / 100;
  const currency = String(params.currency ?? "usd").toUpperCase();
  const reference = orderId.slice(0, 8) + "…" + orderId.slice(-6);

  const html = `
  <div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial;line-height:1.6;color:#111">
    <h2 style="margin:0 0 12px;font-weight:600">付款已确认 ✅</h2>
    <p style="margin:0 0 18px">我们已成功收到您的付款，预约已记录。</p>

    <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:12px 0">
      <tr><td style="padding:6px 16px 6px 0;color:#666">参考号</td><td style="padding:6px 0">${reference}</td></tr>
      <tr><td style="padding:6px 16px 6px 0;color:#666">预约号</td><td style="padding:6px 0">${params.bookingId ?? ""}</td></tr>
      <tr><td style="padding:6px 16px 6px 0;color:#666">金额</td><td style="padding:6px 0">${amount.toFixed(2)} ${currency}</td></tr>
    </table>

    <p style="margin:18px 0 0;color:#555">
      如需修改时间或人数，请回到预约页面重新提交（以最新一条为准）。
    </p>
    <p style="margin:24px 0 0;color:#888;font-size:13px">
      此邮件用于确认付款状态，请妥善保存。
    </p>
  </div>
  `;

  const { resend } = getResend();
  const r = await resend.emails.send({
    from,
    to,
    subject: "付款已确认｜预约已记录",
    html,
  });

  // 写回 resend_id 方便追踪
  await sb
    .from("email_events")
    .update({ resend_id: (r as any)?.data?.id ?? null })
    .eq("id", inserted.id);

  return {
    ok: true,
    sent: true,
    to,
    from,
    resendId: (r as any)?.data?.id ?? null,
  };
}