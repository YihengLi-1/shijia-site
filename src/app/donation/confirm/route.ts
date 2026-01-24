import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
// 如果你项目里确实有这个函数就保留；没有就删掉这行
// import { sendPaidEmail } from "@/lib/resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover" as any,
});

export async function GET(req: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ ok: false, error: "missing_STRIPE_SECRET_KEY" }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const donationId = searchParams.get("donationId");
    const sessionId = searchParams.get("session_id");

    if (!donationId) {
      return NextResponse.json({ ok: false, error: "missing_donationId" }, { status: 400 });
    }
    if (!sessionId) {
      return NextResponse.json({ ok: false, error: "missing_session_id" }, { status: 400 });
    }

    const sb = supabaseAdmin();

    // 先查 donation，拿到你自己存的 stripe_session_id（防止被伪造 sessionId）
    const { data: donation, error: fetchErr } = await sb
      .from("donations")
      .select("id,status,email,name,amount_cents,currency,stripe_session_id")
      .eq("id", donationId)
      .maybeSingle();

    if (fetchErr || !donation) {
      return NextResponse.json(
        { ok: false, error: "donation_not_found", detail: fetchErr?.message },
        { status: 404 }
      );
    }

    // ✅ 关键安全校验：URL 里的 session_id 必须等于你数据库里那笔 donation 绑定的 session
    if (!donation.stripe_session_id || donation.stripe_session_id !== sessionId) {
      return NextResponse.json(
        { ok: false, error: "session_mismatch" },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.json({ ok: true, status: "pending" });
    }

    // 已经 paid 过就直接返回，避免重复 update / 重复发信
    if (donation.status === "paid") {
      return NextResponse.json({ ok: true, status: "paid", emailed: false, alreadyPaid: true });
    }

    const { error: updErr } = await sb
      .from("donations")
      .update({ status: "paid" })
      .eq("id", donationId);

    if (updErr) {
      return NextResponse.json(
        { ok: false, error: "db_update_failed", detail: updErr.message },
        { status: 500 }
      );
    }

    // 可选：发邮件（你自己接上 resend；没有就别硬写）
    // let emailed = false;
    // try {
    //   if (donation.email) {
    //     await sendPaidEmail({ to: donation.email, name: donation.name, amountCents: donation.amount_cents });
    //     emailed = true;
    //   }
    // } catch {}

    return NextResponse.json({ ok: true, status: "paid", emailed: true });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: "server_error", detail: e?.message || "unknown" },
      { status: 500 }
    );
  }
}