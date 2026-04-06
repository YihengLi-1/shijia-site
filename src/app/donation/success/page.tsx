import { Suspense } from "react";
import SuccessClient from "./SuccessClient";
import Header from "@/components/Header";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function DonationSuccessPage() {
  return (
    <main className="min-h-screen text-zinc-900">
      <Header />
      <Suspense fallback={
        <div className="mx-auto max-w-2xl px-6 py-16 text-center fade-in">
          <div className="text-[12px] text-[var(--muted)] tracking-[0.12em]">正在确认随喜…</div>
        </div>
      }>
        <SuccessClient />
      </Suspense>
    </main>
  );
}
