import { Lightbulb } from "lucide-react";
import type { ThermalInsight } from "../types/insight";

export function InsightsSection({ insights }: { insights: ThermalInsight[] }) {
  return (
    <section className="side-panel" aria-labelledby="insights-title">
      <header className="side-panel-header">
        <Lightbulb className="h-5 w-5 text-warm" aria-hidden />
        <div>
          <p className="section-kicker">CONTEXT</p>
          <h2 id="insights-title" className="section-title">
            溫度洞察
          </h2>
        </div>
      </header>
      {insights.length ? (
        <ul className="insight-list">
          {insights.map((insight) => (
            <li key={insight.title}>
              <span aria-hidden>{insight.icon}</span>
              <div>
                <strong>{insight.title}</strong>
                <p>{insight.description}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="empty-state">輸入有效溫度後顯示情境比較。</div>
      )}
    </section>
  );
}
