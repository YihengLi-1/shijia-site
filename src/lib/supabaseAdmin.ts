// src/lib/supabaseAdmin.ts
import { createClient } from "@supabase/supabase-js";

export function requireEnv(name: string) {
  const v = (process.env[name] ?? "").trim();
  if (!v) throw new Error(`missing ${name}`);
  return v;
}

export function supabaseAdmin() {
  const url = requireEnv("SUPABASE_URL");
  const key = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key, { auth: { persistSession: false } });
}

export const getSupabaseAdmin = supabaseAdmin;