// src/app/api/menu/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type MenuRow = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  price_cents: number | null;
  is_available: boolean | null;
  sort: number | null;
  image_url: string | null;
};

const MIN_MENU_ITEMS = 18;

const CURATED_VEGAN_MENU: Array<{
  name: string;
  description: string;
  category: "main" | "side" | "soup" | "dessert" | "drink";
  price_cents: number;
  sort: number;
}> = [
  { name: "香菇芋头煲", description: "香菇与芋头慢炖，绵密温润。", category: "main", price_cents: 1299, sort: 11 },
  { name: "时蔬罗汉斋", description: "十余种当季蔬菜清炒，不勾重芡。", category: "main", price_cents: 1399, sort: 12 },
  { name: "松子青豆炒饭", description: "糙米与青豆、松子轻炒，颗粒分明。", category: "main", price_cents: 1099, sort: 13 },
  { name: "莲藕板栗焖饭", description: "莲藕、板栗与香米焖煮，甘香清雅。", category: "main", price_cents: 1199, sort: 14 },
  { name: "菌菇豆腐煲", description: "多菌与嫩豆腐同煨，汤汁清鲜。", category: "main", price_cents: 1299, sort: 15 },
  { name: "凉拌木耳黄瓜", description: "木耳与黄瓜清拌，微酸开胃。", category: "side", price_cents: 699, sort: 21 },
  { name: "芝麻菠菜", description: "菠菜焯后拌白芝麻，清香不腻。", category: "side", price_cents: 699, sort: 22 },
  { name: "香干芹菜丝", description: "芹香爽脆，少油快炒。", category: "side", price_cents: 799, sort: 23 },
  { name: "五香毛豆", description: "低盐慢卤，入口清淡回甘。", category: "side", price_cents: 599, sort: 24 },
  { name: "番茄豆腐羹", description: "番茄酸甜自然，豆腐细嫩。", category: "soup", price_cents: 799, sort: 31 },
  { name: "南瓜小米羹", description: "南瓜与小米细熬，口感柔和。", category: "soup", price_cents: 799, sort: 32 },
  { name: "莲子百合汤", description: "莲子百合同煮，清甜安神。", category: "soup", price_cents: 899, sort: 33 },
  { name: "海带豆芽汤", description: "海带与豆芽清煮，鲜爽轻盈。", category: "soup", price_cents: 799, sort: 34 },
  { name: "桂花银耳羹", description: "银耳细炖，桂花微香。", category: "dessert", price_cents: 699, sort: 41 },
  { name: "红豆薏米露", description: "红豆薏米慢熬，不额外加糖浆。", category: "dessert", price_cents: 699, sort: 42 },
  { name: "黑芝麻糊", description: "黑芝麻细磨现煮，温润顺口。", category: "dessert", price_cents: 799, sort: 43 },
  { name: "陈皮普洱", description: "陈皮与普洱温泡，回甘清和。", category: "drink", price_cents: 399, sort: 51 },
  { name: "龙井清茶", description: "当日热泡，清香淡雅。", category: "drink", price_cents: 399, sort: 52 },
  { name: "枸杞菊花饮", description: "清润微甜，随餐温饮。", category: "drink", price_cents: 399, sort: 53 },
];

function normName(v: string | null | undefined) {
  return String(v || "").trim().toLowerCase();
}

export async function GET() {
  const sb = supabaseAdmin();
  const baseQuery = () =>
    sb
      .from("menu_items")
      .select("id,name,description,category,price_cents,is_available,sort,image_url")
      .eq("is_available", true)
      .order("category", { ascending: true })
      .order("sort", { ascending: true })
      .order("name", { ascending: true });

  let { data, error } = await baseQuery();

  if (error) {
    return NextResponse.json(
      { ok: false, error: "menu_fetch_failed", detail: error.message },
      { status: 500 }
    );
  }

  const current = (data ?? []) as MenuRow[];
  if (current.length < MIN_MENU_ITEMS) {
    const existingNameSet = new Set(current.map((it) => normName(it.name)));
    const missing = CURATED_VEGAN_MENU.filter((it) => !existingNameSet.has(normName(it.name)));

    if (missing.length > 0) {
      const { error: seedErr } = await sb.from("menu_items").insert(
        missing.map((it) => ({
          name: it.name,
          description: it.description,
          category: it.category,
          price_cents: it.price_cents,
          is_available: true,
          sort: it.sort,
        }))
      );

      if (!seedErr) {
        const refreshed = await baseQuery();
        if (!refreshed.error) data = refreshed.data;
      }
    }
  }

  return NextResponse.json({ ok: true, items: (data ?? []) as MenuRow[] });
}
