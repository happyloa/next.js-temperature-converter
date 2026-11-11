"use client";

import { ErrorFallback } from "./components/ErrorFallback";

/**
 * App Router 錯誤邊界：捕捉路由區段內未處理的例外，
 * 讓使用者看到符合品牌風格的錯誤畫面而非瀏覽器預設畫面。
 */
export default function RouteError(props: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return <ErrorFallback {...props} />;
}
