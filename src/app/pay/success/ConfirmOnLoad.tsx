"use client";

import { useEffect } from "react";

export default function ConfirmOnLoad({
  orderId,
  sessionId,
}: {
  orderId: string;
  sessionId?: string;
}) {
  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!orderId || !sessionId) return;

      try {
        await fetch("/api/pay/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId, sessionId }),
        }).catch(() => null);
      } catch {
        // 静默：不影响用户体验
      }

      if (cancelled) return;
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [orderId, sessionId]);

  return null;
}