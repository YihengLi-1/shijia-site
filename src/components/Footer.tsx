"use client";

import Link from "next/link";
import Container from "@/components/Container";
import { SITE } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-zinc-200/70 bg-white/70">
      <Container className="py-10">
        <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="flex items-center gap-2">
              <div
                className="h-7 w-7"
                style={{ background: 'url("/seal-mark.svg") center/contain no-repeat' }}
              />
              <div className="text-sm font-semibold text-zinc-900 serif-title">{SITE.name}</div>
            </div>
            <div className="mt-2 text-xs text-zinc-600">{SITE.address}</div>
            <div className="mt-2 text-xs text-zinc-600">{SITE.hours}</div>
            <div className="mt-2 text-xs text-zinc-600">{SITE.contact}</div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-600">
            {SITE.nav.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-zinc-900">
                {item.label}
              </Link>
            ))}
            <Link href="/veggie" className="hover:text-zinc-900">
              素食斋
            </Link>
            <a
              href={SITE.mapUrl}
              target="_blank"
              rel="noreferrer"
              className="hover:text-zinc-900"
            >
              导航
            </a>
          </div>
        </div>

        <div className="mt-6 text-xs text-zinc-500 serif-title">愿此供斋，回向一切众生。</div>
        <div className="mt-2 text-xs text-zinc-500">© 2026 {SITE.name}</div>
      </Container>
    </footer>
  );
}
