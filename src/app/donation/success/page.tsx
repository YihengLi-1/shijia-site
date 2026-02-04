import { Suspense } from "react";
import SuccessClient from "./SuccessClient";
import Header from "@/components/Header";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function DonationSuccessPage() {
  return (
    <main className="min-h-screen text-zinc-900">
      <Header />
      <Suspense fallback={<div className="mx-auto max-w-3xl px-6 py-12">Loading...</div>}>
        <SuccessClient />
      </Suspense>
    </main>
  );
}
