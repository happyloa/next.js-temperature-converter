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

export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-edge-subtle bg-canvas">
      <div className="mx-auto flex min-h-20 max-w-[1304px] items-center justify-between gap-2 px-4 md:px-8">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2 text-ink-strong sm:gap-3"
        >
          <span className="grid size-10 shrink-0 place-items-center bg-accent text-accent-ink">
            <Thermometer className="size-6" strokeWidth={1.5} aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block whitespace-nowrap text-sm font-bold tracking-tight sm:text-base">
              溫度工作室
            </span>
            <span className="hidden text-caption text-ink-subtle sm:block">
              Temperature Studio
            </span>
          </span>
        </Link>
        <div className="flex shrink-0 items-center gap-2 sm:gap-6">
          <nav aria-label="主要導覽" className="flex self-stretch sm:gap-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={pathname === link.href ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-11 items-center whitespace-nowrap border-b-2 px-1 text-xs font-bold transition-[border-color] sm:px-3 sm:text-sm",
                  pathname === link.href
                    ? "border-accent-label text-ink-strong"
                    : "border-transparent text-ink-subtle hover:border-edge-strong hover:text-ink-strong",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <ThemeToggleButton />
        </div>
      </div>
    </header>
  );
}
