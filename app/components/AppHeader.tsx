"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Thermometer } from "lucide-react";
import { cn } from "../lib/utils";
import { ThemeToggleButton } from "./ThemeToggleButton";

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
    <header className="sticky top-0 z-40 w-full border-b border-edge-subtle bg-canvas">
      <div className="mx-auto flex min-h-16 max-w-[1180px] items-center justify-between gap-3 px-4 py-2 md:px-6 max-[430px]:px-3">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2.5 rounded-xl text-sm font-bold text-ink-strong"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-edge-subtle bg-surface-strong text-accent">
            <Thermometer className="h-[1.125rem] w-[1.125rem]" aria-hidden />
          </span>
          <span className="truncate max-[430px]:max-w-[5.5rem]">
            溫度工作室
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <nav
            aria-label="主要導覽"
            className="flex items-center gap-1 rounded-xl border border-edge-subtle bg-surface-soft p-1"
          >
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "min-w-[3.9rem] rounded-lg px-2.5 py-2 text-center text-[0.8125rem] font-bold transition-colors max-[430px]:min-w-[3.25rem] max-[430px]:px-2",
                    isActive
                      ? "bg-surface-strong text-ink-strong shadow-[var(--shadow)]"
                      : "text-ink-medium hover:text-ink-strong",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <ThemeToggleButton />
        </div>
      </div>
    </header>
  );
}
