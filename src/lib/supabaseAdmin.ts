// src/lib/supabaseAdmin.ts
import { createClient } from "@supabase/supabase-js";

export function requireEnv(name: string) {
  const v = (process.env[name] ?? "").trim();
  if (!v) throw new Error(`missing ${name}`);
  return v;
}

// ✅ 统一出口：supabaseAdmin
export function supabaseAdmin() {
  const url = requireEnv("SUPABASE_URL");
  const key = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key, { auth: { persistSession: false } });
}

// ✅ 兼容别名：你代码里如果有人 import getSupabaseAdmin 也不会炸
export const getSupabaseAdmin = supabaseAdmin;