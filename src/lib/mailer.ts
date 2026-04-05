// src/lib/mailer.ts
import { Resend } from "resend";
import { supabaseAdmin, requireEnv } from "@/lib/supabaseAdmin";
import { SITE } from "@/lib/site";

export type EmailType = "paid" | "new_order_admin";

function getResend() {
  const key = requireEnv("RESEND_API_KEY");
  return { resend: new Resend(key), key };
}

function getFrom() {
  return requireEnv("RESEND_FROM");
}

/**
 * Customer email resolver:
 * - EMAIL_TO_OVERRIDE: forces all customer emails to this address (staging/test mode)
 * - Otherwise: sends to the actual customer email
 */
function resolveTo(customerEmail?: string | null) {
  const override = (process.env.EMAIL_TO_OVERRIDE || "").trim();
  if (override) return override;

  const email = (customerEmail || "").trim();
  if (!email) throw new Error("missing customer email (set EMAIL_TO_OVERRIDE or provide customer email)");
  return email;
}

/**
 * Admin notification email target.
 * Set ADMIN_NOTIFY_EMAIL in your environment to receive new order alerts.
 */
function getAdminEmail(): string | null {
  return (process.env.ADMIN_NOTIFY_EMAIL || "").trim() || null;
}

// ─── Customer: paid confirmation ──────────────────────────────────────────────

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
  const to   = resolveTo(params.customerEmail);

  const sb = supabaseAdmin();

  // Idempotency: claim slot in email_events (unique on type + order_id)
  const { data: inserted, error: insErr } = await sb
    .from("email_events")
    .insert({ type: "paid", order_id: orderId, to_email: to, from_email: from })
    .select("id")
    .single();

  if (insErr) {
    return { ok: true, skipped: true, reason: "already_sent" as const };
  }

  const amount    = Number(params.amountCents ?? 0) / 100;
  const currency  = String(params.currency ?? "usd").toUpperCase();
  const reference = orderId.slice(0, 8) + "…" + orderId.slice(-6);

  const html = `
<div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial;line-height:1.65;color:#1a1713;max-width:520px">
  <p style="margin:0 0 6px;font-size:13px;color:#8a7e72;letter-spacing:0.06em;text-transform:uppercase">${SITE.name} · ${SITE.nameEn}</p>
  <h2 style="margin:0 0 16px;font-size:20px;font-weight:600">付款已确认 · Payment Confirmed ✓</h2>
  <p style="margin:0 0 20px;color:#4a4540">我们已收到您的付款，预约已记录。<br>
  <span style="font-size:13px;color:#8a7e72">Your payment has been received and your reservation is confirmed.</span></p>

  <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%;margin:0 0 24px;background:#f8f4ee;border-radius:12px;overflow:hidden">
    <tr><td style="padding:12px 16px;color:#8a7e72;font-size:12px;border-bottom:1px solid #e0d8cc">参考号 · Reference</td><td style="padding:12px 16px;font-size:13px;font-weight:600;border-bottom:1px solid #e0d8cc">${reference}</td></tr>
    <tr><td style="padding:12px 16px;color:#8a7e72;font-size:12px;border-bottom:1px solid #e0d8cc">预约号 · Booking ID</td><td style="padding:12px 16px;font-size:13px;border-bottom:1px solid #e0d8cc">${params.bookingId ?? "—"}</td></tr>
    <tr><td style="padding:12px 16px;color:#8a7e72;font-size:12px">金额 · Amount</td><td style="padding:12px 16px;font-size:13px;font-weight:600">${amount.toFixed(2)} ${currency}</td></tr>
  </table>

  <p style="margin:0 0 8px;font-size:13px;color:#4a4540">
    如需修改时间或人数，请提前联系管理员。<br>
    <span style="color:#8a7e72">To change your visit time or party size, please contact us in advance.</span>
  </p>
  <p style="margin:24px 0 0;font-size:12px;color:#8a7e72;font-style:italic">愿此供斋，回向一切众生。</p>
  <p style="margin:4px 0 0;font-size:11px;color:#b0a090">${SITE.address}</p>
</div>`;

  const { resend } = getResend();
  const r = await resend.emails.send({
    from,
    to,
    subject: `付款已确认 · Payment Confirmed — ${SITE.name}`,
    html,
  });

  await sb
    .from("email_events")
    .update({ resend_id: (r as any)?.data?.id ?? null })
    .eq("id", inserted.id);

  return { ok: true, sent: true, to, from, resendId: (r as any)?.data?.id ?? null };
}

// ─── Admin: new order notification ────────────────────────────────────────────

export async function sendNewOrderAdminEmail(params: {
  orderId: string;
  bookingId?: string | null;
  name: string;
  phone: string;
  email?: string | null;
  visitDate: string;
  visitTime: string;
  partySize: number;
  amountCents: number;
  currency?: string | null;
  items?: Array<{ name: string; qty: number; unitPriceCents: number }>;
}) {
  const adminEmail = getAdminEmail();
  if (!adminEmail) {
    // No admin email configured — skip silently (non-blocking)
    return { ok: true, skipped: true, reason: "no_admin_email" as const };
  }

  const from     = getFrom();
  const amount   = params.amountCents / 100;
  const currency = String(params.currency ?? "usd").toUpperCase();
  const orderId  = params.orderId.slice(0, 8) + "…" + params.orderId.slice(-6);
  const itemsHtml = (params.items ?? [])
    .map((it) => `<tr>
      <td style="padding:8px 12px;font-size:12px;border-bottom:1px solid #e0d8cc">${it.name}</td>
      <td style="padding:8px 12px;font-size:12px;text-align:center;border-bottom:1px solid #e0d8cc">×${it.qty}</td>
      <td style="padding:8px 12px;font-size:12px;text-align:right;border-bottom:1px solid #e0d8cc">$${((it.unitPriceCents * it.qty) / 100).toFixed(2)}</td>
    </tr>`)
    .join("");

  const html = `
<div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;line-height:1.6;color:#1a1713;max-width:520px">
  <p style="margin:0 0 4px;font-size:12px;color:#8a7e72;text-transform:uppercase;letter-spacing:0.06em">后台通知 · Admin Notification</p>
  <h2 style="margin:0 0 18px;font-size:18px;font-weight:600">新订单 · New Order 🔔</h2>

  <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%;margin:0 0 16px;background:#f8f4ee;border-radius:10px;overflow:hidden">
    <tr><td style="padding:10px 14px;color:#8a7e72;font-size:11.5px;border-bottom:1px solid #e0d8cc">订单号</td><td style="padding:10px 14px;font-size:12px;font-family:monospace;border-bottom:1px solid #e0d8cc">${params.orderId}</td></tr>
    <tr><td style="padding:10px 14px;color:#8a7e72;font-size:11.5px;border-bottom:1px solid #e0d8cc">预约号</td><td style="padding:10px 14px;font-size:12px;font-family:monospace;border-bottom:1px solid #e0d8cc">${params.bookingId ?? "—"}</td></tr>
    <tr><td style="padding:10px 14px;color:#8a7e72;font-size:11.5px;border-bottom:1px solid #e0d8cc">姓名</td><td style="padding:10px 14px;font-size:13px;font-weight:600;border-bottom:1px solid #e0d8cc">${params.name}</td></tr>
    <tr><td style="padding:10px 14px;color:#8a7e72;font-size:11.5px;border-bottom:1px solid #e0d8cc">电话</td><td style="padding:10px 14px;font-size:13px;border-bottom:1px solid #e0d8cc">${params.phone}</td></tr>
    <tr><td style="padding:10px 14px;color:#8a7e72;font-size:11.5px;border-bottom:1px solid #e0d8cc">邮箱</td><td style="padding:10px 14px;font-size:12px;border-bottom:1px solid #e0d8cc">${params.email ?? "—"}</td></tr>
    <tr><td style="padding:10px 14px;color:#8a7e72;font-size:11.5px;border-bottom:1px solid #e0d8cc">到访日期</td><td style="padding:10px 14px;font-size:13px;font-weight:600;border-bottom:1px solid #e0d8cc">${params.visitDate}</td></tr>
    <tr><td style="padding:10px 14px;color:#8a7e72;font-size:11.5px;border-bottom:1px solid #e0d8cc">到访时间</td><td style="padding:10px 14px;font-size:13px;border-bottom:1px solid #e0d8cc">${params.visitTime}</td></tr>
    <tr><td style="padding:10px 14px;color:#8a7e72;font-size:11.5px;border-bottom:1px solid #e0d8cc">人数</td><td style="padding:10px 14px;font-size:13px;border-bottom:1px solid #e0d8cc">${params.partySize} 人</td></tr>
    <tr><td style="padding:10px 14px;color:#8a7e72;font-size:11.5px">金额</td><td style="padding:10px 14px;font-size:13px;font-weight:600;color:#5a7352">${amount.toFixed(2)} ${currency}</td></tr>
  </table>

  ${itemsHtml ? `
  <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:#4a4540">供斋内容：</p>
  <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%;margin:0 0 16px;border:1px solid #e0d8cc;border-radius:8px;overflow:hidden">
    ${itemsHtml}
  </table>` : ""}

  <p style="margin:0;font-size:12px;color:#8a7e72">
    <a href="${SITE.url}/admin/orders" style="color:#5a7352">→ 前往后台查看订单</a>
  </p>
</div>`;

  try {
    const { resend } = getResend();
    await resend.emails.send({
      from,
      to: adminEmail,
      subject: `新订单 [${params.name}] ${params.visitDate} ${params.visitTime} · ${amount.toFixed(2)} ${currency}`,
      html,
    });
    return { ok: true, sent: true, to: adminEmail };
  } catch (e: any) {
    // Non-fatal: log and continue — don't block the booking flow
    console.error(JSON.stringify({ level: "error", msg: "admin_email_failed", error: String(e?.message ?? e) }));
    return { ok: false, error: String(e?.message ?? e) };
  }
}
