// src/app/api/menu/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const { data, error } = await supabaseAdmin()
    .from("menu_items")
    .select("id,name,description,category,price_cents,is_available,sort,image_url")
    .eq("is_available", true)
    .order("category", { ascending: true })
    .order("sort", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    return NextResponse.json(
      { ok: false, error: "menu_fetch_failed", detail: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, items: data ?? [] });
}