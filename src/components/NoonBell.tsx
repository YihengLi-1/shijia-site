"use client";

import { useEffect, useRef, useState } from "react";

function getLosAngelesNow() {
  const laString = new Date().toLocaleString("en-US", {
    timeZone: "America/Los_Angeles",
  });

  return new Date(laString);
}

function getDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function NoonBell() {
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState(0);
  const visibleRef = useRef(false);
  const fallbackFiredDayRef = useRef<string | null>(null);

  useEffect(() => {
    visibleRef.current = visible;
  }, [visible]);

  useEffect(() => {
    const triggerBell = () => {
      if (visibleRef.current) {
        return;
      }

      setVisible(true);
      setPhase(1);
    };

    const checkBell = () => {
      const laNow = getLosAngelesNow();
      const hours = laNow.getHours();
      const minutes = laNow.getMinutes();

      if (hours !== 12 || minutes !== 0) {
        return;
      }

      const dateKey = getDateKey(laNow);
      const storageKey = `noon_bell_${dateKey}`;

      if (fallbackFiredDayRef.current === dateKey) {
        return;
      }

      try {
        if (sessionStorage.getItem(storageKey) === "1") {
          fallbackFiredDayRef.current = dateKey;
          return;
        }

        sessionStorage.setItem(storageKey, "1");
      } catch {
        if (fallbackFiredDayRef.current === dateKey) {
          return;
        }
      }

      fallbackFiredDayRef.current = dateKey;
      triggerBell();
    };

    checkBell();
    const intervalId = window.setInterval(checkBell, 30_000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const phaseTwoTimer = window.setTimeout(() => setPhase(2), 2_000);
    const phaseThreeTimer = window.setTimeout(() => setPhase(3), 2_500);
    const dismissTimer = window.setTimeout(() => setPhase(4), 4_500);
    const hideTimer = window.setTimeout(() => {
      setVisible(false);
      setPhase(0);
    }, 5_500);

    return () => {
      window.clearTimeout(phaseTwoTimer);
      window.clearTimeout(phaseThreeTimer);
      window.clearTimeout(dismissTimer);
      window.clearTimeout(hideTimer);
    };
  }, [visible]);

  if (!visible) {
    return null;
  }

  return (
    <div
      className={`noon-overlay fixed inset-0 z-[9000] flex items-center justify-center px-6 text-center backdrop-blur-sm ${
        phase >= 4 ? "dismissing" : ""
      }`}
      style={{ backgroundColor: "rgba(23, 17, 12, 0.92)" }}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className={`noon-line-1 serif-title text-2xl font-light tracking-[0.2em] text-[var(--bg)] ${
            phase >= 1 ? "visible" : ""
          }`}
          style={{ transitionDelay: phase >= 1 ? "0.8s" : "0s" }}
        >
          午时供斋时刻
        </div>

        <div
          className={`noon-line-2 h-px w-24 border-t border-[color:rgba(245,239,227,0.2)] ${
            phase >= 2 ? "visible" : ""
          }`}
        />

        <div
          className={`noon-line-2 serif-title text-xl font-light tracking-[0.14em] text-[var(--bg)] ${
            phase >= 2 ? "visible" : ""
          }`}
        >
          愿十方众生同得饱足。
        </div>

        <div
          className={`noon-en text-xs italic text-[color:rgba(245,239,227,0.35)] ${
            phase >= 3 ? "visible" : ""
          }`}
        >
          Noon offering hour — may all beings be nourished.
        </div>
      </div>
    </div>
  );
}
