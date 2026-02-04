// src/app/pay/page.tsx
import PayClient from "./PayClient";
import Header from "@/components/Header";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function PayPage() {
  return (
    <main className="min-h-screen text-zinc-900">
      <Header hideCta />
      <PayClient />
    </main>
  );
}
