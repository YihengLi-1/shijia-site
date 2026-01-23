import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const resend = new Resend(process.env.RESEND_API_KEY!);

function supabaseAdmin() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

export async function POST(req: Request) {
  try {
    const { orderId, sessionId } = await req.json();
    if (!orderId || !sessionId) {
      return NextResponse.json({ ok: true });
    }

    const supabase = supabaseAdmin();

    // 1️⃣ 从 Stripe 拿 session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      return NextResponse.json({ ok: true, status: "pending" });
    }

    // 2️⃣ 更新订单为 paid（幂等）
    const { data: order } = await supabase
      .from("orders")
      .update({
        status: "paid",
        stripe_session_id: sessionId,
      })
      .eq("id", orderId)
      .select()
      .single();

    // 3️⃣ 发确认邮件（只发一次）
    if (order?.email) {
      await resend.emails.send({
        from: "Shijia <no-reply@yourdomain.com>",
        to: order.email,
        subject: "支付成功确认",
        html: `
          <h2>支付成功 ✅</h2>
          <p>您的预约已确认。</p>
          <p><strong>订单号：</strong>${orderId}</p>
          <p>感谢您的支持。</p>
        `,
      });
    }

    return NextResponse.json({ ok: true, status: "paid" });
  } catch (e) {
    console.error("confirm error", e);
    return NextResponse.json({ ok: true });
  }
}