// src/app/pay/success/page.tsx
import { Suspense } from "react";
import SuccessClient from "./SuccessClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function PaySuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-2xl px-6 py-16">
          Loading…
        </div>
      }
    >
      <SuccessClient />
    </Suspense>
  );
}