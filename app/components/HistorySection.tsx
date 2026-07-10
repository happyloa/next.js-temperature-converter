"use client";

import { useState } from "react";
import { ChevronDown, History, Trash2 } from "lucide-react";

import { ui } from "../lib/uiStyles";
import { cn } from "../lib/utils";
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
    <section className={cn(ui.panel, "p-4")} aria-labelledby="history-title">
      <header className="flex min-w-0 items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <History className="h-5 w-5 text-accent" aria-hidden />
          <div>
            <p className={ui.kicker}>HISTORY</p>
            <h2 id="history-title" className={ui.sectionTitle}>
              轉換紀錄
            </h2>
          </div>
        </div>
        <span className={ui.count}>{history.length} / 8</span>
      </header>

      <div className="mt-3.5 flex min-w-0 items-start justify-between gap-4 max-[430px]:flex-col max-[430px]:items-stretch">
        <ExportButton history={history} />
        {confirmingClear ? (
          <div
            className="flex flex-wrap items-center gap-2 max-[430px]:[&>*]:flex-1"
            role="group"
            aria-label="確認清除紀錄"
          >
            <button
              type="button"
              className={cn(ui.button, ui.dangerButton)}
              onClick={() => {
                onClearHistory();
                setConfirmingClear(false);
              }}
            >
              確認清除
            </button>
            <button
              type="button"
              className={cn(ui.button, ui.secondaryButton)}
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
            className={cn(ui.button, ui.secondaryButton, "max-[430px]:flex-1")}
          >
            <Trash2 className="h-4 w-4" aria-hidden />
            清除
          </button>
        )}
      </div>

      {history.length ? (
        <div className="mt-3">
          {history.map((entry) => (
            <details
              key={entry.id}
              className="group border-t border-edge-subtle"
            >
              <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 py-2.5 text-ink-medium [&::-webkit-details-marker]:hidden">
                <span className="flex min-w-0 flex-col">
                  <strong className="text-[0.8125rem] text-ink-strong">
                    {formatTemperature(entry.value)} {entry.scaleSymbol}
                  </strong>
                  <small className="text-[0.6875rem] text-ink-subtle">
                    {new Date(entry.timestamp).toLocaleDateString("zh-TW")} ·{" "}
                    {formatTime(new Date(entry.timestamp))}
                  </small>
                </span>
                <ChevronDown
                  className="h-4 w-4 transition-transform group-open:rotate-180"
                  aria-hidden
                />
              </summary>
              <div className="grid grid-cols-3 gap-1.5 pb-3">
                {entry.conversions.map((item) => (
                  <span
                    key={`${entry.id}-${item.code}`}
                    className="min-w-0 rounded-md bg-surface-soft p-2 text-center"
                  >
                    <small className="block [overflow-wrap:anywhere] text-[0.6875rem]">
                      {item.symbol}
                    </small>
                    <b className="block [overflow-wrap:anywhere] text-[0.6875rem]">
                      {formatTemperature(item.result)}
                    </b>
                  </span>
                ))}
              </div>
            </details>
          ))}
        </div>
      ) : (
        <div className={cn(ui.emptyState, "mt-3")}>
          加入紀錄後，最近八筆會保存在此裝置。
        </div>
      )}
    </section>
  );
}
