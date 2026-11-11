import Link from "next/link";
import { StatusPage } from "./components/StatusPage";
import { ui } from "./lib/uiStyles";
import { cn } from "./lib/utils";

export default function NotFound() {
  return (
    <StatusPage
      visual={
        <p className="mb-6 text-7xl font-normal tracking-[-0.06em] text-accent-label sm:text-9xl">
          404
        </p>
      }
      title="找不到這個頁面"
      description="請確認網址，或返回溫度轉換器。"
    >
      <Link href="/" className={cn(ui.button, ui.primaryButton)}>
        返回首頁
      </Link>
    </StatusPage>
  );
}
