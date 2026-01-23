// src/app/pay/page.tsx
import { Suspense } from "react";
import PayClient from "./PayClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function PayPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-3xl px-6 py-12">Loading...</div>}>
      <PayClient />
    </Suspense>
  );
}