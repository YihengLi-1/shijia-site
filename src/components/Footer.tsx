"use client";

import Link from "next/link";
import Container from "@/components/Container";
import { SITE } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-[var(--line)]" style={{ background: "rgba(23,17,12,0.03)" }}>
      <Container className="py-14">
        <div className="grid gap-10 md:grid-cols-[1.6fr_1fr_1fr]">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="seal-stamp" aria-hidden="true">释</div>
              <div>
                <div className="text-[13px] font-medium text-[var(--ink)] serif-title leading-tight">
                  {SITE.name}
                </div>
                <div className="text-[10.5px] text-[var(--muted)] tracking-[0.07em] mt-0.5">
                  {SITE.nameEn}
                </div>
              </div>
            </div>
            <p className="text-[12.5px] text-[var(--muted)] leading-[1.85] max-w-xs mb-5">
              {SITE.introEn}
            </p>
            <a
              href={SITE.mapUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[12px] text-[var(--ink-2)] hover:text-[var(--ink)] transition-colors"
            >
              {SITE.address}
            </a>
          </div>

          {/* Navigation */}
          <div>
            <div className="eyebrow mb-5">导航 · Navigation</div>
            <nav className="space-y-3" aria-label="页脚导航">
              {[...SITE.nav, { label: "素食斋", labelEn: "Pure Veg", href: "/veggie" }].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-baseline gap-2 text-[13px] text-[var(--ink-2)] hover:text-[var(--ink)] transition-colors group"
                >
                  <span>{item.label}</span>
                  <span className="text-[10.5px] text-[var(--muted)] group-hover:text-[var(--ink-2)] transition-colors">
                    {item.labelEn}
                  </span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Info */}
          <div>
            <div className="eyebrow mb-5">联系 · Contact</div>
            <div className="space-y-4 text-[12.5px]">
              <div>
                <div className="text-[10.5px] text-[var(--muted)] mb-1">电话 · Phone</div>
                <div className="text-[var(--ink-2)]">
                  {SITE.phone !== "+1XXXXXXXXXX" ? SITE.phone : "请现场或提前预约"}
                </div>
              </div>
              <div>
                <div className="text-[10.5px] text-[var(--muted)] mb-1">营业时间 · Hours</div>
                <div className="text-[var(--ink-2)]">{SITE.hoursEn}</div>
                <div className="text-[11px] text-[var(--muted)] mt-0.5">{SITE.hours}</div>
              </div>
              <div className="pt-1">
                <a
                  href={SITE.mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-[var(--muted)] hover:text-[var(--ink-2)] transition-colors"
                  style={{ borderBottom: "1px solid var(--line)", paddingBottom: "2px" }}
                >
                  在地图中打开 · Open in Maps →
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-10 pt-6 flex flex-col gap-1.5"
          style={{ borderTop: "1px solid var(--line)" }}
        >
          <div className="serif-title italic text-[13px] text-[var(--muted)]">
            愿此供斋，回向一切众生。
          </div>
          <div className="flex items-center justify-between flex-wrap gap-2 text-[11px] text-[var(--muted)]">
            <span>© 2026 {SITE.name} · {SITE.nameEn}</span>
            <span>{SITE.address}</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
