// src/components/Header.tsx
import Link from "next/link";
import Container from "@/components/Container";
import { SITE } from "@/lib/site";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/70 bg-white/80 backdrop-blur">
      <Container className="flex h-14 items-center justify-between">
        <Link href="/" className="text-sm font-semibold tracking-wide text-zinc-900">
          {SITE.name}
        </Link>

        {/* 桌面导航 */}
        <nav className="hidden items-center gap-6 text-sm text-zinc-700 md:flex">
          {SITE.nav.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-zinc-900">
              {item.label}
            </Link>
          ))}
        </nav>

        {/* 右侧按钮 */}
        <a
          href={SITE.mapUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium hover:border-zinc-400"
        >
          导航
        </a>
      </Container>
    </header>
  );
}