"use client";

import { useSearchParams } from "next/navigation";

export default function PayClient() {
  const sp = useSearchParams();

  // 你原来在 /pay/page.tsx 里怎么用 searchParams，这里照搬即可
  // 先给你一个安全的兜底写法，不会因为参数缺失爆炸：
  const bookingId = sp.get("bookingId") ?? "";
  const amount = sp.get("amount") ?? "";

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      {/* TODO：把你原本 /pay 的 JSX 内容搬到这里 */}
      <h1 className="text-2xl font-semibold mb-2">支付</h1>

      <p className="text-gray-600">
        bookingId: {bookingId || "(无)"} / amount: {amount || "(无)"}
      </p>

      {/* 这里继续放你原本的支付按钮、表单、说明等 */}
    </div>
  );
}