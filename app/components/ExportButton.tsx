"use client";

import type { FC } from "react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { cn } from "../lib/utils";
import type { HistoryEntry } from "../types/history";

interface ExportButtonProps {
  history: HistoryEntry[];
  formatTemperature: (value: number) => string;
  className?: string;
}

/**
 * Export button for downloading history as CSV or copying to clipboard.
 */
export const ExportButton: FC<ExportButtonProps> = ({
  history,
  formatTemperature,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstItemRef = useRef<HTMLButtonElement>(null);

  const flashStatus = useCallback((next: "success" | "error") => {
    setStatus(next);
    setTimeout(() => setStatus("idle"), 2000);
  }, []);

  const closeMenu = useCallback((returnFocus: boolean) => {
    setIsOpen(false);
    if (returnFocus) {
      triggerRef.current?.focus();
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      firstItemRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeMenu]);

  const generateCSV = useCallback((): string => {
    if (history.length === 0) return "";

    // CSV header
    const headers = [
      "時間",
      "攝氏 (°C)",
      "華氏 (°F)",
      "絕對溫標 (K)",
      "蘭氏 (°R)",
      "列氏 (°Ré)",
      "牛頓氏 (°N)",
    ];

    // CSV rows
    const rows = history.map((entry) => {
      const date = new Date(entry.timestamp);
      const timeStr = date.toLocaleString("zh-TW");

      const values = entry.conversions.map((c) => formatTemperature(c.result));
      return [timeStr, ...values].join(",");
    });

    return [headers.join(","), ...rows].join("\n");
  }, [history, formatTemperature]);

  const handleExportCSV = useCallback(() => {
    try {
      const csv = generateCSV();
      if (!csv) {
        flashStatus("error");
        return;
      }

      // Create blob and download
      const blob = new Blob(["﻿" + csv], {
        type: "text/csv;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `temperature-history-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      closeMenu(false);
      flashStatus("success");
    } catch {
      flashStatus("error");
    }
  }, [generateCSV, flashStatus, closeMenu]);

  const handleCopyToClipboard = useCallback(async () => {
    try {
      const csv = generateCSV();
      if (!csv) {
        flashStatus("error");
        return;
      }

      await navigator.clipboard?.writeText(csv);
      closeMenu(false);
      flashStatus("success");
    } catch {
      flashStatus("error");
    }
  }, [generateCSV, flashStatus, closeMenu]);

  const handleExportJSON = useCallback(() => {
    try {
      if (history.length === 0) {
        flashStatus("error");
        return;
      }

      const json = JSON.stringify(history, null, 2);
      const blob = new Blob([json], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `temperature-history-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      closeMenu(false);
      flashStatus("success");
    } catch {
      flashStatus("error");
    }
  }, [history, flashStatus, closeMenu]);

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={menuId}
        className={cn(
          "flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-all duration-200",
          status === "success"
            ? "theme-status-success"
            : status === "error"
              ? "theme-status-error"
              : "bg-surface-light text-ink-medium hover:bg-surface-soft hover:text-ink-strong",
          className,
        )}
        aria-label="匯出紀錄"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-4 h-4"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M12 2.25a.75.75 0 01.75.75v11.69l3.22-3.22a.75.75 0 111.06 1.06l-4.5 4.5a.75.75 0 01-1.06 0l-4.5-4.5a.75.75 0 111.06-1.06l3.22 3.22V3a.75.75 0 01.75-.75zm-9 13.5a.75.75 0 01.75.75v2.25a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5V16.5a.75.75 0 011.5 0v2.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V16.5a.75.75 0 01.75-.75z"
            clipRule="evenodd"
          />
        </svg>
        <span aria-live="polite">
          {status === "success" ? "已匯出" : status === "error" ? "失敗" : "匯出"}
        </span>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => closeMenu(false)}
          />
          <div
            id={menuId}
            role="menu"
            aria-label="匯出選項"
            className="border-edge-subtle bg-surface-strong shadow-glass absolute right-0 top-full z-50 mt-2 min-w-40 rounded-xl border p-1 backdrop-blur"
          >
            <button
              ref={firstItemRef}
              type="button"
              role="menuitem"
              onClick={handleExportCSV}
              className="text-ink-medium hover:bg-surface-soft hover:text-ink-strong flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm"
            >
              <span aria-hidden="true">📊</span>
              <span>下載 CSV</span>
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={handleExportJSON}
              className="text-ink-medium hover:bg-surface-soft hover:text-ink-strong flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm"
            >
              <span aria-hidden="true">📋</span>
              <span>下載 JSON</span>
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={handleCopyToClipboard}
              className="text-ink-medium hover:bg-surface-soft hover:text-ink-strong flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm"
            >
              <span aria-hidden="true">📎</span>
              <span>複製到剪貼簿</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};
