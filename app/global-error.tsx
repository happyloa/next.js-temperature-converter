"use client";

import { useLayoutEffect } from "react";
import "./globals.css";
import { ErrorFallback } from "./components/ErrorFallback";
import { applyTheme, resolveTheme } from "./lib/theme";

/**
 * 根 layout 發生錯誤時取代整個文件，因此需自行提供 html、body、
 * 全域樣式與主題（根 layout 的主題腳本不會套用到這裡）。
 */
export default function GlobalError(props: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useLayoutEffect(() => {
    applyTheme(resolveTheme());
  }, []);

  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <body className="font-sans">
        <title>頁面暫時無法載入 | 溫度工作室</title>
        <ErrorFallback {...props} fullReload />
      </body>
    </html>
  );
}
