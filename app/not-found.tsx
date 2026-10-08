import Link from "next/link";
import { ui } from "./lib/uiStyles";
import { cn } from "./lib/utils";

export default function NotFound() {
  return (
    <main id="main-content" className={ui.pageShell}>
      <div
        className={cn(
          ui.workspace,
          "min-h-[55vh] border-l-4 border-accent-label pl-6 py-12 sm:pl-10",
        )}
      >
        <p className="mb-6 text-7xl font-normal tracking-[-0.06em] text-accent-label sm:text-9xl">
          404
        </p>
        <h1 className={ui.pageTitle}>找不到這個頁面</h1>
        <p className={ui.description}>請確認網址，或返回溫度轉換器。</p>
        <Link href="/" className={cn(ui.button, ui.primaryButton, "mt-8")}>
          返回首頁
        </Link>
      </div>
    </main>
  );
}
