// src/components/WhySection.tsx
import Link from "next/link";

const FEATURES = [
  {
    num: "01",
    titleZh: "清净空间",
    titleEn: "A space for stillness",
    descZh: "留一点空与静，让心慢下来。光影自生，无需多言。",
  },
  {
    num: "02",
    titleZh: "当季食材",
    titleEn: "With the season",
    descZh: "随时令更替，味淡而温。不求新奇，只求应时。",
  },
  {
    num: "03",
    titleZh: "随缘护持",
    titleEn: "Sustained by community",
    descZh: "随喜随缘，量力而行。护持用于香灯与供斋，感恩每一份心意。",
  },
];

export default function WhySection({ intro, introEn }: { intro: string; introEn?: string }) {
  return (
    <div>
      {/* Section eyebrow */}
      <p className="eyebrow mb-7">此处为何 · Why this place</p>

      {/* Intro paragraph */}
      <p className="text-[clamp(0.95rem,1.8vw,1.1rem)] leading-[2] text-[var(--ink-2)] max-w-xl mb-3">
        {intro}
      </p>
      {introEn && (
        <p className="text-[13px] leading-[1.8] text-[var(--muted)] max-w-xl mb-12 italic font-display">
          {introEn}
        </p>
      )}

      {/* Three features — typographic grid with vertical dividers */}
      <div className="border-t border-[var(--line)] grid md:grid-cols-3 md:divide-x md:divide-[var(--line)]">
        {FEATURES.map((f) => (
          <div key={f.num} className="pt-8 pb-8 md:px-8 md:first:pl-0 md:last:pr-0 border-t border-[var(--line)] md:border-t-0 first:border-t-0">
            <div className="text-[10px] font-medium tracking-[0.22em] text-[var(--muted)] uppercase mb-5">
              {f.num}
            </div>
            <h3 className="text-[19px] font-semibold serif-title text-[var(--ink)] mb-1.5">
              {f.titleZh}
            </h3>
            <p className="text-[12px] italic font-display text-[var(--muted)] mb-4">
              {f.titleEn}
            </p>
            <p className="text-[13px] text-[var(--ink-2)] leading-[1.9]">
              {f.descZh}
            </p>
          </div>
        ))}
      </div>

      {/* CTA row */}
      <div className="mt-0 pt-8 border-t border-[var(--line)] flex flex-wrap gap-3">
        <Link
          href="/menu"
          className="rounded-full px-5 py-2.5 text-[13px] font-semibold pressable cta-shimmer temple-cta"
        >
          开始供斋 · Dining
        </Link>
        <Link
          href="/visit"
          className="rounded-full px-5 py-2.5 text-[13px] font-medium pressable temple-ghost"
        >
          来访须知 · Visit
        </Link>
        <Link
          href="/donation"
          className="rounded-full px-5 py-2.5 text-[13px] font-medium pressable temple-ghost"
        >
          随喜护持 · Donate
        </Link>
        <Link
          href="/about"
          className="rounded-full px-5 py-2.5 text-[13px] font-medium pressable temple-ghost"
        >
          关于道场 · About
        </Link>
      </div>
    </div>
  );
}
