"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { ui } from "../lib/uiStyles";
import { cn } from "../lib/utils";
import { StatusPage } from "./StatusPage";

/**
 * error.tsx 與 global-error.tsx 共用的錯誤畫面。
 * 根 layout 失效時以完整重新載入返回首頁，避免沿用損壞的用戶端狀態。
 */
export function ErrorFallback({
  error,
  retry,
  fullReload = false,
}: {
  error: unknown;
  retry: () => void;
  fullReload?: boolean;
}) {
  useEffect(() => {
    console.error("Unhandled route error", error);
  }, [error]);

  const homeClassName = cn(ui.button, ui.secondaryButton);

  return (
    <StatusPage
      visual={
        <AlertTriangle
          className="mb-6 size-12 text-accent-label"
          strokeWidth={1.5}
          aria-hidden
        />
      }
      title="頁面暫時無法載入"
      description="請重新載入，或返回首頁再試一次。"
    >
      <button
        type="button"
        onClick={retry}
        className={cn(ui.button, ui.primaryButton)}
      >
        重試
      </button>
      {fullReload ? (
        <a href="/" className={homeClassName}>
          返回首頁
        </a>
      ) : (
        <Link href="/" className={homeClassName}>
          返回首頁
        </Link>
      )}
    </StatusPage>
  );
}
