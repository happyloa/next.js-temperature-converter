"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../lib/utils";

const NAV_LINKS = [
  { href: "/", label: "轉換器" },
  { href: "/weather", label: "天氣" },
];

/**
 * 全站共用導覽列，讓轉換器與天氣頁之間有對稱、隨處可見的導覽入口。
 */
export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="border-edge-subtle bg-surface-strong sticky top-0 z-40 w-full border-b backdrop-blur-xl transition-colors duration-300">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-ink-strong flex items-center gap-2 text-sm font-bold"
        >
          <span className="text-xl" aria-hidden="true">
            🌡️
          </span>
          <span className="hidden sm:inline">溫度工作室</span>
        </Link>

        <nav aria-label="主要導覽" className="flex items-center gap-2">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={cn("theme-chip", isActive && "theme-chip--active")}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
