"use client";

import { useEffect, useRef, useState } from "react";

import type { HistoryEntry } from "../types/history";
import { ExportButton } from "./ExportButton";

/**
 * 歷史紀錄區塊，使用手風琴呈現最新八筆轉換內容。
 */

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
  type AccordionState = { mode: "auto" } | { mode: "manual"; id: string };

  const [accordionState, setAccordionState] = useState<AccordionState>({
    mode: "auto",
  });

  const latestEntryId = history[0]?.id ?? null;
  const manualEntryExists =
    accordionState.mode === "manual" &&
    history.some((entry) => entry.id === accordionState.id);
  const openEntryId = manualEntryExists ? accordionState.id : latestEntryId;

  const handleToggle = (entryId: string) => {
    if (!entryId) {
      return;
    }

    const currentOpenId = openEntryId;

    setAccordionState(
      currentOpenId === entryId
        ? { mode: "auto" }
        : { mode: "manual", id: entryId },
    );
  };

  return (
    <section className="w-full min-w-0 space-y-6 rounded-3xl border border-edge-subtle bg-surface-medium p-5 shadow-glass backdrop-blur transition-colors sm:p-6 md:p-7">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 text-ink-medium">
          <span className="text-xl">🗂️</span>
          <h2 className="text-heading text-ink-strong">轉換紀錄</h2>
        </div>
        <p className="text-sm text-ink-medium">
          將感興趣的轉換加入歷史紀錄，可快速對照實驗或製程所需的常用溫度設定。
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-ink-subtle">
          {history.length > 0
            ? `共 ${history.length} 筆，依時間由新到舊排序`
            : "尚未加入紀錄"}
        </span>
        <div className="flex gap-2">
          <ExportButton
            history={history}
            formatTemperature={formatTemperature}
          />
          <button
            type="button"
            onClick={onClearHistory}
            disabled={history.length === 0}
            className="theme-outline-button theme-outline-button--small"
          >
            清除紀錄
          </button>
        </div>
      </div>
      <ol className="space-y-4 list-none m-0 p-0">
        {history.map((entry) => {
          const isOpen = openEntryId === entry.id;
          const contentId = `${entry.id}-content`;

          return (
            <HistoryAccordionItem
              key={entry.id}
              contentId={contentId}
              entry={entry}
              isOpen={isOpen}
              onToggle={handleToggle}
              formatTemperature={formatTemperature}
              formatTime={formatTime}
            />
          );
        })}
        {history.length === 0 && (
          <li className="list-none">
            <p className="rounded-2xl border border-dashed border-edge-subtle bg-surface-soft p-4 text-sm text-ink-medium transition-colors">
              加入紀錄後，系統會保留最近八筆轉換，方便在不同實驗之間快速比對。
            </p>
          </li>
        )}
      </ol>
    </section>
  );
}

type HistoryAccordionItemProps = {
  contentId: string;
  entry: HistoryEntry;
  isOpen: boolean;
  onToggle: (entryId: string) => void;
  formatTemperature: (value: number) => string;
  formatTime: (value: Date) => string;
};

function HistoryAccordionItem({
  contentId,
  entry,
  isOpen,
  onToggle,
  formatTemperature,
  formatTime,
}: HistoryAccordionItemProps) {
  const panelRef = useAccordionPanel(isOpen);

  return (
    <li className="min-w-0 overflow-hidden rounded-2xl border border-edge-subtle bg-surface-strong shadow-sm transition-colors list-none">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={contentId}
        onClick={() => onToggle(entry.id)}
        className="flex w-full flex-wrap items-center justify-between gap-3 px-4 py-3 text-left text-sm text-ink-medium transition-colors hover:bg-surface-soft"
      >
        <span className="font-medium text-ink-strong">
          {formatTime(new Date(entry.timestamp))} ·{" "}
          {formatTemperature(entry.value)} {entry.scaleSymbol}
        </span>
        <span className="flex items-center gap-2 text-xs text-ink-subtle">
          {entry.scaleLabel}
          <span
            aria-hidden="true"
            className={`transition-transform duration-400 ease-out ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}
          >
            ▼
          </span>
        </span>
      </button>
      <div
        id={contentId}
        ref={panelRef}
        aria-hidden={!isOpen}
        className={`overflow-hidden border-t border-edge-subtle transition-[height,opacity] duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div
          className={`px-4 pb-4 pt-3 transition-[opacity,transform] duration-300 ease-out ${
            isOpen ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0"
          }`}
        >
          <div className="grid gap-2">
            {entry.conversions.map((item) => (
              <div
                key={`${entry.id}-${item.code}`}
                className="flex min-w-0 items-center justify-between rounded-xl border border-edge-subtle bg-surface-soft px-3 py-2 text-sm text-ink-medium transition-colors"
              >
                <span className="font-medium">{item.label}</span>
                <span className="font-semibold">
                  {formatTemperature(item.result)} {item.symbol}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </li>
  );
}

function useAccordionPanel(isOpen: boolean) {
  const panelRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  /**
   * 透過動態計算高度，達成平滑的手風琴開合效果。
   */
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) {
      return;
    }

    if (isFirstRender.current) {
      isFirstRender.current = false;
      panel.style.height = isOpen ? "auto" : "0px";
      return;
    }

    let animationFrameId: number | undefined;

    const handleTransitionEnd = (event: TransitionEvent) => {
      if (event.propertyName === "height" && isOpen && panelRef.current) {
        panelRef.current.style.height = "auto";
      }
    };

    panel.addEventListener("transitionend", handleTransitionEnd);

    const measuredHeight = panel.scrollHeight;

    if (isOpen) {
      panel.style.height = `${measuredHeight}px`;
    } else {
      if (panel.style.height === "" || panel.style.height === "auto") {
        panel.style.height = `${measuredHeight}px`;
      }

      animationFrameId = window.requestAnimationFrame(() => {
        if (!panelRef.current) {
          return;
        }

        panelRef.current.style.height = "0px";
      });
    }

    return () => {
      panel.removeEventListener("transitionend", handleTransitionEnd);

      if (animationFrameId !== undefined) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const panel = panelRef.current;
    if (!panel || typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(() => {
      if (!panelRef.current) {
        return;
      }

      panelRef.current.style.height = "auto";
    });

    observer.observe(panel);

    return () => {
      observer.disconnect();
    };
  }, [isOpen]);

  return panelRef;
}
