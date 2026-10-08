import { Lightbulb } from "lucide-react";
import { ui } from "../lib/uiStyles";
import { cn } from "../lib/utils";
import type { ThermalInsight } from "../types/insight";

export function InsightsSection({ insights }: { insights: ThermalInsight[] }) {
  return (
    <section
      className={cn(ui.panel, "border-t-2 border-t-ink-strong p-5")}
      aria-labelledby="insights-title"
    >
      <header className="flex min-w-0 items-center justify-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center text-accent-label">
          <Lightbulb className="h-4 w-4" aria-hidden />
        </span>
        <div>
          <h2 id="insights-title" className={ui.sectionTitle}>
            溫度洞察
          </h2>
        </div>
      </header>
      {insights.length ? (
        <ul className="mt-4 list-none">
          {insights.map((insight) => (
            <li
              key={insight.title}
              className="grid grid-cols-[0.5rem_minmax(0,1fr)] gap-2.5 border-t border-edge-subtle py-4 first:border-t-0"
            >
              <span className="mt-1 h-3 w-px bg-accent" aria-hidden />
              <div>
                <strong className="text-detail text-ink-strong">
                  {insight.title}
                </strong>
                <p className="mt-1 text-xs text-ink-medium">
                  {insight.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className={cn(ui.emptyState, "mt-3")}>
          輸入有效溫度後顯示情境比較。
        </div>
      )}
    </section>
  );
}
