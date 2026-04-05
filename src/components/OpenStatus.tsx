"use client";

import { useEffect, useState } from "react";

export default function OpenStatus() {
  const [status, setStatus] = useState<"open" | "closed" | null>(null);

  useEffect(() => {
    // Temple hours: 5:00 AM – 9:00 PM daily, Pacific Time
    const checkStatus = () => {
      const now = new Date();
      const pt = new Date(now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
      const h = pt.getHours();
      const m = pt.getMinutes();
      const totalMins = h * 60 + m;
      // 5:00 = 300 mins, 21:00 = 1260 mins
      setStatus(totalMins >= 300 && totalMins < 1260 ? "open" : "closed");
    };
    checkStatus();
    const id = setInterval(checkStatus, 60000);
    return () => clearInterval(id);
  }, []);

  if (status === null) return null;

  return (
    <span className="inline-flex items-center gap-1.5 text-[10.5px] font-medium tracking-[0.06em]"
      style={{ color: status === "open" ? "var(--sage)" : "var(--muted)" }}
    >
      <span
        className="w-[6px] h-[6px] rounded-full shrink-0"
        style={{
          background: status === "open" ? "var(--sage)" : "var(--muted)",
          boxShadow: status === "open" ? "0 0 0 2px rgba(78,107,71,0.2)" : "none",
          animation: status === "open" ? "pulse-dot 2.5s ease-in-out infinite" : "none",
        }}
      />
      {status === "open" ? "营业中 · Open" : "已打烊 · Closed"}
    </span>
  );
}
