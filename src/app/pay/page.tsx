import { Suspense } from "react";
import PayClient from "./PayClient";

export const runtime = "nodejs";

export default function PayPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-3xl px-6 py-12">Loading...</div>}>
      <PayClient />
    </Suspense>
  );
}