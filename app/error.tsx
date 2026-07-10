"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ui } from "./lib/uiStyles";
import { cn } from "./lib/utils";

/**
 * App Router 錯誤邊界：捕捉路由區段內未處理的例外，
 * 讓使用者看到符合品牌風格的錯誤畫面而非瀏覽器預設畫面。
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled route error", error);
  }, [error]);

  return (
    <main
      id="main-content"
      className="flex w-full flex-col items-center justify-center gap-6 px-4 py-32 text-center"
    >
      <span className="text-5xl" aria-hidden="true">
        ⚠️
      </span>
      <div className="space-y-2">
        <h1 className="text-xl font-bold text-ink-strong">發生了一些問題</h1>
        <p className="text-ink-medium max-w-md text-sm leading-relaxed">
          頁面暫時無法正常運作，請稍後再試，或返回首頁重新開始。
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className={cn(ui.button, ui.primaryButton)}
        >
          重試
        </button>
        <Link href="/" className={cn(ui.button, ui.secondaryButton)}>
          返回首頁
        </Link>
      </div>
    </main>
  );
}
