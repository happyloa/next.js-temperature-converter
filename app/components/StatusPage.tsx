import type { ReactNode } from "react";
import { ui } from "../lib/uiStyles";
import { cn } from "../lib/utils";

/** 404 與錯誤頁共用的版面。 */
export function StatusPage({
  visual,
  title,
  description,
  children,
}: {
  visual: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main id="main-content" className={ui.pageShell}>
      <div
        className={cn(
          ui.workspace,
          "min-h-[55vh] border-l-4 border-accent-label pl-6 py-12 sm:pl-10",
        )}
      >
        {visual}
        <h1 className={ui.pageTitle}>{title}</h1>
        <p className={ui.description}>{description}</p>
        <div className="mt-8 flex flex-wrap gap-3">{children}</div>
      </div>
    </main>
  );
}
