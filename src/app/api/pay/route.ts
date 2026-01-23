import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { bookingId?: string };
    const bookingId = (body.bookingId || "").trim();

    if (!bookingId) {
      return NextResponse.json({ error: "missing_bookingId" }, { status: 400 });
    }

    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      return NextResponse.json({ error: "missing_supabase_env" }, { status: 500 });
    }

    const supabase = createClient(url, key);

    // ⚠️ 你的 bookingId 是你生成的字符串，不是 uuid id
    // 你现在表里应该有 booking_id 这一列（之前报错就是它不存在）
    const { error } = await supabase
      .from("bookings")
      .update({ status: "paid" })
      .eq("booking_id", bookingId);

    if (error) {
      return NextResponse.json(
        { error: "supabase_update_failed", detail: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: "server_error", detail: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}