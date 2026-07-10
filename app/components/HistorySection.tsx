"use client";

import { useState } from "react";
import { ChevronDown, History, Trash2 } from "lucide-react";

import type { HistoryEntry } from "../types/history";
import { ExportButton } from "./ExportButton";

type HistorySectionProps = {
  history: HistoryEntry[];
  onClearHistory: () => void;
  formatTemperature: (value: number) => string;
  formatTime: (value: Date) => string;
};

export function HistorySection({
  history,
  onClearHistory,
  formatTemperature,
  formatTime,
}: HistorySectionProps) {
  const [confirmingClear, setConfirmingClear] = useState(false);

  return (
    <section className="side-panel" aria-labelledby="history-title">
      <header className="side-panel-header side-panel-header--split">
        <div className="flex items-center gap-3">
          <History className="h-5 w-5 text-accent" aria-hidden />
          <div>
            <p className="section-kicker">HISTORY</p>
            <h2 id="history-title" className="section-title">
              轉換紀錄
            </h2>
          </div>
        </div>
        <span className="result-count">{history.length} / 8</span>
      </header>

      <div className="history-actions">
        <ExportButton history={history} />
        {confirmingClear ? (
          <div
            className="confirm-actions"
            role="group"
            aria-label="確認清除紀錄"
          >
            <button
              type="button"
              className="danger-button"
              onClick={() => {
                onClearHistory();
                setConfirmingClear(false);
              }}
            >
              確認清除
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => setConfirmingClear(false)}
            >
              取消
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmingClear(true)}
            disabled={!history.length}
            className="secondary-button"
          >
            <Trash2 className="h-4 w-4" aria-hidden />
            清除
          </button>
        )}
      </div>

      {history.length ? (
        <div className="history-list">
          {history.map((entry) => (
            <details key={entry.id} className="history-item">
              <summary>
                <span>
                  <strong>
                    {formatTemperature(entry.value)} {entry.scaleSymbol}
                  </strong>
                  <small>
                    {new Date(entry.timestamp).toLocaleDateString("zh-TW")} ·{" "}
                    {formatTime(new Date(entry.timestamp))}
                  </small>
                </span>
                <ChevronDown className="h-4 w-4" aria-hidden />
              </summary>
              <div className="history-conversions">
                {entry.conversions.map((item) => (
                  <span key={`${entry.id}-${item.code}`}>
                    <small>{item.symbol}</small>
                    <b>{formatTemperature(item.result)}</b>
                  </span>
                ))}
              </div>
            </details>
          ))}
        </div>
      ) : (
        <div className="empty-state">加入紀錄後，最近八筆會保存在此裝置。</div>
      )}
    </section>
  );
}
