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

export function getFrom() {
  return requireEnv("RESEND_FROM"); // e.g. "Shijia <no-reply@shijiafoguo.com>"
}

/**
 * 早期上线推荐：强制发到你自己邮箱，避免误发给客户
 * - EMAIL_TO_OVERRIDE: 强制收件人（调试阶段用）
 * - EMAIL_DEFAULT_TO: 没有 override 时用的默认收件人
 */
export function getTo() {
  const toOverride = (process.env.EMAIL_TO_OVERRIDE || "").trim();
  const def = (process.env.EMAIL_DEFAULT_TO || "").trim();
  const to = toOverride || def;
  if (!to) throw new Error("missing EMAIL_TO_OVERRIDE or EMAIL_DEFAULT_TO");
  return to;
}