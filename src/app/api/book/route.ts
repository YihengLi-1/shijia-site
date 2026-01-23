// src/app/api/book/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type Payload = {
  name: string;
  phone: string;
  email?: string;
  people: number | string;
  date: string; // accept: "YYYY-MM-DD" or "MM/DD/YYYY" etc.
  time: string; // accept: "HH:MM" or "HH:MM AM/PM"
  note?: string;
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toISODate(input: string) {
  const v = String(input || "").trim();
  if (!v) throw new Error("date_required");

  // "YYYY-MM-DD"
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;

  // "MM/DD/YYYY" -> "YYYY-MM-DD"
  const m = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) {
    const mm = pad2(Number(m[1]));
    const dd = pad2(Number(m[2]));
    const yyyy = m[3];
    return `${yyyy}-${mm}-${dd}`;
  }

  // 其他格式：尽量别阻塞，直接存原样（你表里 date 多半是 text）
  return v;
}

function toTimeHHMMSS(input: string) {
  const v = String(input || "").trim();
  if (!v) throw new Error("time_required");

  // "HH:MM" (24h)
  const m24 = v.match(/^(\d{1,2}):(\d{2})$/);
  if (m24) {
    const hh = Number(m24[1]);
    const mm = Number(m24[2]);
    if (hh < 0 || hh > 23 || mm < 0 || mm > 59) throw new Error("invalid_time");
    return `${pad2(hh)}:${pad2(mm)}:00`;
  }

  // "HH:MM AM/PM"
  const m12 = v.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (m12) {
    let hh = Number(m12[1]);
    const mm = Number(m12[2]);
    const ap = m12[3].toUpperCase();
    if (hh < 1 || hh > 12 || mm < 0 || mm > 59) throw new Error("invalid_time");
    if (ap === "AM") {
      if (hh === 12) hh = 0;
    } else {
      if (hh !== 12) hh += 12;
    }
    return `${pad2(hh)}:${pad2(mm)}:00`;
  }

  // 兜底：如果你 DB 的 time 是 text，这也能存；如果是 time 类型，这会失败并给出明确信息
  // 但我们宁愿失败也不要插 null
  return v;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Payload;

    const name = String(body?.name ?? "").trim();
    const phone = String(body?.phone ?? "").trim();
    const peopleNum = Number(body?.people ?? 0);
    const dateVal = toISODate(String(body?.date ?? ""));
    const timeVal = toTimeHHMMSS(String(body?.time ?? ""));

    if (!name) return NextResponse.json({ detail: "name_required" }, { status: 400 });
    if (!phone) return NextResponse.json({ detail: "phone_required" }, { status: 400 });
    if (!Number.isFinite(peopleNum) || peopleNum < 1 || peopleNum > 50) {
      return NextResponse.json({ detail: "people_invalid" }, { status: 400 });
    }

    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      return NextResponse.json({ detail: "missing_supabase_env" }, { status: 500 });
    }

    const supabase = createClient(url, key, { auth: { persistSession: false } });

    // ✅ 按你表的“必填约束”至少写入：name/phone/people/date/time
    const { data, error } = await supabase
      .from("bookings")
      .insert({
        name,
        phone,
        people: peopleNum,
        date: dateVal,
        time: timeVal,
        // 其他字段如果表里存在再加；如果不存在就不要加，避免列不存在报错
      })
      .select("id")
      .single();

    if (error) {
      console.error("supabase insert error:", error);
      return NextResponse.json(
        { error: "supabase_insert_failed", detail: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ bookingId: data.id }, { status: 200 });
  } catch (e: any) {
    console.error("/api/book error:", e);
    return NextResponse.json(
      { error: "server_error", detail: String(e?.message || e || "unknown") },
      { status: 500 }
    );
  }
}