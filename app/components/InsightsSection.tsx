import type { ThermalInsight } from "../types/insight";

type InsightsSectionProps = {
  insights: ThermalInsight[];
};

/**
 * 依據輸入溫度提供即時建議與安全提示的資訊區塊。
 */

export function InsightsSection({ insights }: InsightsSectionProps) {
  return (
    <section className="w-full min-w-0 space-y-6 rounded-3xl border border-edge-subtle bg-surface-medium p-5 shadow-glass backdrop-blur sm:p-6 md:p-7">
      <div className="text-ink-medium flex items-center gap-3">
        <span className="text-xl">💡</span>
        <h2 className="text-heading">溫度洞察</h2>
      </div>
      <ul className="space-y-4 list-none m-0 p-0">
        {insights.length > 0 ? (
          insights.map((insight) => (
            <li
              key={insight.title}
              className="flex min-w-0 items-start gap-4 rounded-2xl border border-edge-subtle bg-surface-strong p-4"
            >
              <span className="text-2xl" aria-hidden="true">
                {insight.icon}
              </span>
              <div className="space-y-1">
                <p className="text-base font-semibold text-ink-strong">
                  {insight.title}
                </p>
                <p className="text-sm text-ink-medium">{insight.description}</p>
              </div>
            </li>
          ))
        ) : (
          <li className="rounded-2xl border border-dashed border-edge-subtle bg-surface-soft p-4 text-sm text-ink-subtle">
            先輸入溫度，即可獲得冰點、沸點與風險評估等即時分析。
          </li>
        )}
      </ul>
    </section>
  );
}
