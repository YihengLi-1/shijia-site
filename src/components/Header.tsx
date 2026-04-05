"use client";

import Link from "next/link";
import { useState } from "react";
import { SITE } from "@/lib/site";

export default function Header({ hideCta = false }: { hideCta?: boolean } = {}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* ── Sticky header bar ──────────────────────────── */}
      <header className="sticky top-0 z-50 h-[56px] flex items-center justify-between px-6 md:px-10 glass border-b border-[var(--line)]">

        {/* Seal logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group"
          onClick={() => setOpen(false)}
        >
          <div
            className="seal-stamp group-hover:bg-[var(--red)] group-hover:text-[var(--bg)]"
            aria-hidden="true"
          >
            释
          </div>
          <span className="text-[13px] font-medium tracking-[0.02em] text-[var(--ink)] serif-title">
            {SITE.name}
          </span>
        </Link>

        {/* Menu toggle */}
        <button
          type="button"
          aria-label={open ? "关闭菜单" : "打开菜单"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="flex items-center gap-3 focus-ring rounded-sm"
        >
          <span className="hidden sm:block text-[10.5px] font-medium tracking-[0.18em] uppercase text-[var(--muted)]">
            {open ? "关闭" : "菜单"}
          </span>
          <div className="flex flex-col gap-[5px] w-5" aria-hidden="true">
            <span
              className="block h-px bg-[var(--ink)] transition-all duration-300 origin-left"
              style={{ transform: open ? "rotate(45deg) translate(1px, 3px)" : "" }}
            />
            <span
              className="block h-px bg-[var(--ink)] transition-all duration-300"
              style={{ opacity: open ? 0 : 1 }}
            />
            <span
              className="block h-px bg-[var(--ink)] w-3 ml-auto transition-all duration-300 origin-right"
              style={{ transform: open ? "rotate(-45deg) translate(-1px, -3px) scaleX(1.67)" : "" }}
            />
          </div>
        </button>
      </header>

      {/* ── Full-screen overlay nav ────────────────────── */}
      {open && (
        <div
          className="nav-overlay"
          role="dialog"
          aria-label="导航菜单"
          aria-modal="true"
        >
          {/* Left red accent */}
          <div
            className="absolute left-0 top-0 bottom-0 w-[3px] pointer-events-none"
            style={{ background: "linear-gradient(to bottom, var(--red) 0%, transparent 75%)" }}
          />

          {/* Nav links */}
          <nav className="flex flex-col" aria-label="主导航">
            {[
              ...SITE.nav,
              { label: "素食斋", labelEn: "Pure Veg", href: "/veggie" },
            ].map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="nav-overlay-link py-2"
                style={{ animationDelay: `${i * 65 + 60}ms` }}
              >
                <span
                  className="nav-link-zh text-[clamp(2rem,5.5vw,3.8rem)] font-medium serif-title leading-[1.1] transition-opacity duration-200"
                  style={{ color: "rgba(245,239,227,0.88)" }}
                >
                  {item.label}
                </span>
                <span
                  className="text-[11px] tracking-[0.16em] uppercase self-end pb-1 transition-opacity duration-200"
                  style={{ color: "rgba(245,239,227,0.28)" }}
                >
                  {item.labelEn}
                </span>
              </Link>
            ))}
          </nav>

          {/* Bottom info strip */}
          <div
            className="absolute bottom-8 left-[10vw] right-[10vw] flex items-end justify-between border-t pt-5"
            style={{ borderColor: "rgba(245,239,227,0.07)" }}
          >
            <div style={{ color: "rgba(245,239,227,0.22)", fontSize: "11.5px", lineHeight: "1.9" }}>
              <div>{SITE.address}</div>
              <div>{SITE.hoursEn}</div>
            </div>
            <a
              href={SITE.mapUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => setOpen(false)}
              style={{
                color: "rgba(245,239,227,0.32)",
                fontSize: "11px",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              Directions →
            </a>
          </div>
        </div>
      )}
    </>
  );
}
