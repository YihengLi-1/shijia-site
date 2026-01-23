import { createClient } from "@supabase/supabase-js";

type Props = {
  searchParams: {
    orderId?: string;
  };
};

// 服务端安全读取（只读，不登录）
function supabaseAnon() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("missing SUPABASE_URL or SUPABASE_ANON_KEY");
  return createClient(url, key, { auth: { persistSession: false } });
}

export default async function PaySuccessPage({ searchParams }: Props) {
  const orderId = searchParams.orderId ?? "";
  if (!orderId) {
    return (
      <div className="mx-auto max-w-xl px-6 py-20">
        <h1 className="text-2xl font-semibold">支付状态</h1>
        <p className="mt-4 text-gray-600">未找到订单，请返回重新操作。</p>
      </div>
    );
  }

  const supabase = supabaseAnon();

  const { data: order } = await supabase
    .from("orders")
    .select("status, booking_id, stripe_session_id")
    .eq("id", orderId)
    .single();

  const isPaid = order?.status === "paid";
  const reference = orderId.slice(0, 8) + "…" + orderId.slice(-6);

  return (
    <div className="mx-auto max-w-2xl px-6 py-20">
      <h1 className="text-3xl font-semibold tracking-tight">
        支付成功
      </h1>

      <div className="mt-3 flex items-center gap-2">
        {isPaid ? (
          <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
            已确认 ✓
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-sm text-yellow-700">
            处理中
          </span>
        )}
        <span className="text-sm text-gray-500">参考号：{reference}</span>
      </div>

      <p className="mt-6 text-gray-600 leading-relaxed">
        {isPaid
          ? "付款已成功确认，您的预约已经记录。我们期待您的到来。"
          : "我们正在确认付款状态，通常会在几秒内完成，请稍后刷新页面。"}
      </p>

      <div className="mt-10 rounded-2xl border border-gray-200 p-6">
        <h2 className="text-base font-medium mb-3">接下来你可以</h2>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>• 如需修改时间或人数，请返回预约页重新提交（以最新一条为准）</li>
          <li>• 到访前请查看到访须知，保持安静与秩序</li>
          <li>• 如需帮助，我们会通过邮件与您联系</li>
        </ul>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <a
          href="/notice"
          className="rounded-full bg-black px-5 py-2.5 text-sm text-white"
        >
          查看到访须知
        </a>
        <a
          href="/booking"
          className="rounded-full border px-5 py-2.5 text-sm"
        >
          返回预约页
        </a>
        <a
          href="/"
          className="rounded-full border px-5 py-2.5 text-sm"
        >
          返回首页
        </a>
      </div>
    </div>
  );
}