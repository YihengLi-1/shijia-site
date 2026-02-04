// src/app/pay/success/page.tsx
import { Suspense } from "react";
import SuccessClient from "./SuccessClient";
import Header from "@/components/Header";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function PaySuccessPage() {
  return (
    <main className="min-h-screen text-zinc-900">
      <Header hideCta />
      <Suspense fallback={<div className="mx-auto max-w-2xl px-6 py-16">Loading...</div>}>
        <SuccessClient />
      </Suspense>
    </main>
  );
}
