// src/lib/resend.ts
import { Resend } from "resend";

export function requireEnv(name: string) {
  const v = (process.env[name] || "").trim();
  if (!v) throw new Error(`missing ${name}`);
  return v;
}

export function getResend() {
  const key = requireEnv("RESEND_API_KEY");
  return { resend: new Resend(key), key };
}

/**
 * 强制使用你自己的域名发信人：
 * - 只认 RESEND_FROM
 * - 没配就直接 500（不允许“悄悄降级”）
 */
export function getFrom() {
  const from = requireEnv("RESEND_FROM"); // 例如: "释迦佛国素食斋 <noreply@shijiafogu o.com>"
  return from;
}

/**
 * 收件人策略：
 * - EMAIL_TO_OVERRIDE 有值：强制发到这个（上线早期你自己测试用）
 * - 否则 EMAIL_DEFAULT_TO：默认收件人
 */
export function getTo() {
  const toOverride = (process.env.EMAIL_TO_OVERRIDE || "").trim();
  const defaultTo = (process.env.EMAIL_DEFAULT_TO || "").trim();
  const to = toOverride || defaultTo;
  if (!to) throw new Error("missing EMAIL_TO_OVERRIDE or EMAIL_DEFAULT_TO");
  return to;
}