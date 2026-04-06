"use client";

import { useEffect, useState } from "react";
import { getTodayChar } from "@/lib/dailyChar";

type StrokePath = {
  d: string;
  length: number;
};

const CHAR_PATHS: Record<string, StrokePath[]> = {
  "空": [
    { d: "M24 22H76", length: 130 },
    { d: "M50 22V38", length: 88 },
    { d: "M28 48H72", length: 130 },
    { d: "M34 48V74H66V48", length: 185 },
  ],
  "净": [
    { d: "M18 24H38", length: 82 },
    { d: "M16 40H36", length: 82 },
    { d: "M14 56H34", length: 82 },
    { d: "M58 20V78", length: 180 },
    { d: "M74 28V82", length: 168 },
  ],
  "慈": [
    { d: "M28 28C36 18 44 18 50 28", length: 122 },
    { d: "M50 28C56 18 64 18 72 28", length: 122 },
    {
      d: "M34 54Q30 60 35 66 M50 50Q45 58 50 66 M66 54Q70 60 65 66",
      length: 168,
    },
    { d: "M30 74C40 84 60 84 70 74", length: 150 },
  ],
  "悲": [
    {
      d: "M30 18V52 M22 24H38 M22 34H38 M22 44H38",
      length: 182,
    },
    {
      d: "M70 18V52 M62 24H78 M62 34H78 M62 44H78",
      length: 182,
    },
    { d: "M50 18V52", length: 110 },
    {
      d: "M34 62Q30 68 35 74 M50 60Q45 68 50 76 M66 62Q70 68 65 74",
      length: 176,
    },
    { d: "M30 82C40 92 60 92 70 82", length: 150 },
  ],
  "喜": [
    { d: "M30 18V36H70V18H30", length: 190 },
    { d: "M28 46H72 M34 56H66 M38 46V64H62V46", length: 198 },
    { d: "M32 72V88H68V72H32", length: 190 },
  ],
  "舍": [
    { d: "M30 28L50 16L70 28", length: 132 },
    { d: "M28 44H72", length: 128 },
    { d: "M34 52V78H66V52H34", length: 190 },
  ],
  "觉": [
    { d: "M24 22H76V38H24V22", length: 196 },
    { d: "M32 30H68", length: 100 },
    { d: "M50 46V78", length: 112 },
    { d: "M36 54H64 M54 54V72Q58 78 66 76", length: 182 },
  ],
  "定": [
    { d: "M24 26H76 L66 18H34 L24 26", length: 176 },
    { d: "M50 38Q53 43 50 48", length: 78 },
    { d: "M32 56H68", length: 100 },
    { d: "M50 56V82", length: 112 },
    { d: "M36 62V82H68", length: 176 },
  ],
  "忍": [
    { d: "M34 24H66 L56 38V58", length: 176 },
    { d: "M72 26Q77 30 72 36", length: 74 },
    {
      d: "M34 62Q30 68 35 74 M50 60Q45 68 50 76 M66 62Q70 68 65 74",
      length: 176,
    },
    { d: "M30 82C40 92 60 92 70 82", length: 150 },
  ],
  "戒": [
    { d: "M52 20V76", length: 170 },
    { d: "M34 30L72 64", length: 164 },
    { d: "M38 58V82 M62 58V82 M28 68H72", length: 190 },
  ],
  "念": [
    { d: "M32 26L50 16L68 26", length: 128 },
    { d: "M26 34H74 M50 34V50", length: 148 },
    {
      d: "M34 60Q30 66 35 72 M50 58Q45 66 50 74 M66 60Q70 66 65 72",
      length: 176,
    },
    { d: "M30 80C40 90 60 90 70 80", length: 150 },
  ],
  "善": [
    { d: "M30 24H70", length: 118 },
    { d: "M36 18L50 10L64 18", length: 112 },
    { d: "M38 34H62 M46 24V42 M54 24V42", length: 172 },
    { d: "M34 54V80H66V54H34", length: 190 },
  ],
};

function revealStyle(delay: number) {
  return {
    animation: "daily-char-copy 0.8s ease forwards",
    animationDelay: `${delay}s`,
    opacity: 0,
  };
}

export default function DailyChar({ className = "" }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [openCount, setOpenCount] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    if (open) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [mounted, open]);

  const entry = mounted ? getTodayChar() : null;

  const openOverlay = () => {
    setOpenCount((count) => count + 1);
    setOpen(true);
  };

  const closeOverlay = () => {
    setOpen(false);
  };

  const stampClassName = `seal-stamp cursor-pointer bg-transparent p-0 focus-ring ${className}`.trim();

  if (!mounted || !entry) {
    return (
      <>
        <span className={`seal-stamp ${className}`.trim()} aria-hidden="true">
          释
        </span>
        <style>{`
          @keyframes draw-stroke {
            to { stroke-dashoffset: 0; }
          }

          @keyframes daily-char-overlay-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @keyframes daily-char-copy {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </>
    );
  }

  const overlay = open ? (
    <div
      className="fixed inset-0 z-[200] backdrop-blur-md"
      style={{
        backgroundColor: "rgba(23, 17, 12, 0.85)",
        animation: "daily-char-overlay-in 0.4s ease forwards",
      }}
      onClick={closeOverlay}
    >
      <button
        type="button"
        aria-label="关闭今日一字"
        onClick={closeOverlay}
        className="absolute right-5 top-5 text-2xl leading-none text-[color:rgba(245,239,227,0.7)] transition-opacity duration-200 hover:opacity-70 focus-ring rounded-sm px-2 py-1"
      >
        ✕
      </button>

      <div
        className="flex min-h-full flex-col items-center justify-center gap-8 px-6 py-16 text-center"
        onClick={(event) => event.stopPropagation()}
      >
        <svg
          key={openCount}
          viewBox="0 0 100 100"
          width="180"
          height="180"
          aria-hidden="true"
          className="text-[var(--bg)]"
        >
          {CHAR_PATHS[entry.char].map((path, index) => (
            <path
              key={`${entry.char}-${index}`}
              d={path.d}
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                strokeDasharray: path.length,
                strokeDashoffset: path.length,
                animation: "draw-stroke 0.85s ease forwards",
                animationDelay: `${index * 0.3}s`,
              }}
            />
          ))}
        </svg>

        <div className="flex max-w-[30rem] flex-col items-center gap-4">
          <div style={revealStyle(1.2)}>
            <div className="serif-title text-5xl text-[var(--bg)]">{entry.char}</div>
            <div className="mt-1 text-sm tracking-[0.22em] text-[var(--muted-light)]">
              {entry.pinyin}
            </div>
          </div>

          <p className="text-base text-[color:rgba(245,239,227,0.8)]" style={revealStyle(1.8)}>
            {entry.meaning}
          </p>

          <div
            className="max-w-[24rem] border-l border-[color:rgba(245,239,227,0.18)] pl-4 text-left"
            style={revealStyle(2.2)}
          >
            <p className="text-sm leading-8 text-[color:rgba(245,239,227,0.7)]">{entry.quote}</p>
            <p className="mt-2 text-xs tracking-[0.16em] text-[var(--muted-light)]">
              [{entry.source}]
            </p>
          </div>

          <p
            className="text-xs italic text-[color:rgba(245,239,227,0.45)]"
            style={revealStyle(2.6)}
          >
            {entry.en}
          </p>

          <div
            className="eyebrow pt-4 text-[var(--muted-light)]"
            style={revealStyle(2.9)}
          >
            今日一字
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        type="button"
        aria-label={`打开今日一字：${entry.char}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={openOverlay}
        className={stampClassName}
      >
        {entry.char}
      </button>
      {overlay}
      <style>{`
        @keyframes draw-stroke {
          to { stroke-dashoffset: 0; }
        }

        @keyframes daily-char-overlay-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes daily-char-copy {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
