import Link from "next/link";

export function AppFooter() {
  return (
    <footer className="mx-4 border-t border-edge-subtle md:mx-8">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-4 py-7 text-xs text-ink-subtle sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-bold text-ink-strong">溫度工作室</p>
          <p className="mt-1.5">六種溫標換算與全球城市天氣。</p>
        </div>
        <nav aria-label="頁尾導覽" className="flex gap-6">
          <Link href="/" className="py-2 hover:text-ink-strong">
            溫度轉換器
          </Link>
          <Link href="/weather" className="py-2 hover:text-ink-strong">
            城市天氣
          </Link>
        </nav>
      </div>
    </footer>
  );
}
