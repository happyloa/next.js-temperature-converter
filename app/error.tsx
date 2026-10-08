"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { ui } from "./lib/uiStyles";
import { cn } from "./lib/utils";

/**
 * App Router 錯誤邊界：捕捉路由區段內未處理的例外，
 * 讓使用者看到符合品牌風格的錯誤畫面而非瀏覽器預設畫面。
 */
export default function RouteError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled route error", error);
  }, [error]);

  return (
    <main id="main-content" className={ui.pageShell}>
      <div
        className={cn(
          ui.workspace,
          "min-h-[55vh] border-l-4 border-accent-label pl-6 py-12 sm:pl-10",
        )}
      >
        <AlertTriangle
          className="mb-6 size-12 text-accent-label"
          strokeWidth={1.5}
          aria-hidden
        />
        <h1 className={ui.pageTitle}>頁面暫時無法載入</h1>
        <p className={ui.description}>請重新載入，或返回首頁再試一次。</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={retry}
            className={cn(ui.button, ui.primaryButton)}
          >
            重試
          </button>
          <Link href="/" className={cn(ui.button, ui.secondaryButton)}>
            返回首頁
          </Link>
        </div>
      </div>
    </main>
  );
}
