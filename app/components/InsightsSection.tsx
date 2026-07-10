import { Lightbulb } from "lucide-react";
import { ui } from "../lib/uiStyles";
import { cn } from "../lib/utils";
import type { ThermalInsight } from "../types/insight";

export function InsightsSection({ insights }: { insights: ThermalInsight[] }) {
  return (
    <section className={cn(ui.panel, "p-4")} aria-labelledby="insights-title">
      <header className="flex min-w-0 items-center justify-start gap-4">
        <Lightbulb className="h-5 w-5 text-accent" aria-hidden />
        <div>
          <p className={ui.kicker}>CONTEXT</p>
          <h2 id="insights-title" className={ui.sectionTitle}>
            溫度洞察
          </h2>
        </div>
      </header>
      {insights.length ? (
        <ul className="mt-3 list-none">
          {insights.map((insight) => (
            <li
              key={insight.title}
              className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-2.5 border-t border-edge-subtle py-3 first:border-t-0"
            >
              <span aria-hidden>{insight.icon}</span>
              <div>
                <strong className="text-[0.8125rem] text-ink-strong">
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
