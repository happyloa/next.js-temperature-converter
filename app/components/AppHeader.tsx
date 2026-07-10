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
    <header className="sticky top-0 z-40 w-full border-b border-edge-subtle bg-surface-strong">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 max-[430px]:px-3">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2 text-sm font-bold text-ink-strong"
        >
          <Thermometer className="h-5 w-5 shrink-0 text-accent" aria-hidden />
          <span className="truncate max-[430px]:max-w-[5.5rem]">
            溫度工作室
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <nav
            aria-label="主要導覽"
            className="flex items-center gap-0.5 rounded-lg border border-edge-subtle bg-surface-soft p-0.5"
          >
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "min-w-[3.75rem] rounded-md px-2.5 py-1.5 text-center text-[0.8125rem] font-semibold max-[430px]:min-w-[3.25rem] max-[430px]:px-2",
                    isActive
                      ? "bg-surface-strong text-ink-strong shadow-sm"
                      : "text-ink-medium",
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
