// src/components/Header.tsx
"use client";

import Link from "next/link";
import Container from "@/components/Container";
import { SITE } from "@/lib/site";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/70 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="text-sm font-semibold tracking-wide text-zinc-900 serif-title">
          {SITE.name}
        </Link>

        {/* 桌面导航 */}
        <nav className="hidden items-center gap-6 text-sm text-zinc-700 md:flex">
          {SITE.nav.filter((item) => item.label !== "预约").map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:text-zinc-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* 右侧按钮 */}
        <div className="flex items-center gap-2">
          <a
            href={SITE.mapUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold hover:border-zinc-400"
          >
            导航
          </a>
          <Link
            href="/book"
            className="rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800"
          >
            预约
          </Link>
        </div>
      </Container>
      <div className="h-px bg-gradient-to-r from-transparent via-zinc-200/70 to-transparent" />
    </header>
  );
}
