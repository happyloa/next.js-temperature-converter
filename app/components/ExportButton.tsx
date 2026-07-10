"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  Braces,
  Check,
  ClipboardCopy,
  Download,
  FileSpreadsheet,
  X,
} from "lucide-react";

import { copyText } from "../lib/clipboard";
import { historyToCsv } from "../lib/export";
import type { HistoryEntry } from "../types/history";

export function ExportButton({ history }: { history: HistoryEntry[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstItemRef = useRef<HTMLButtonElement>(null);

  const flashStatus = useCallback((next: "success" | "error") => {
    setStatus(next);
    window.setTimeout(() => setStatus("idle"), 2000);
  }, []);

  const closeMenu = useCallback((returnFocus = false) => {
    setIsOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (isOpen) firstItemRef.current?.focus();
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
  }, [closeMenu, isOpen]);

  const download = useCallback(
    (content: string, type: string, extension: string) => {
      const blob = new Blob([content], { type });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = `temperature-history-${new Date().toISOString().slice(0, 10)}.${extension}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      closeMenu();
      flashStatus("success");
    },
    [closeMenu, flashStatus],
  );

  if (!history.length) return null;

  return (
    <div className="menu-root">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={menuId}
        className="secondary-button"
      >
        {status === "success" ? (
          <Check className="h-4 w-4" aria-hidden />
        ) : status === "error" ? (
          <X className="h-4 w-4" aria-hidden />
        ) : (
          <Download className="h-4 w-4" aria-hidden />
        )}
        <span aria-live="polite">
          {status === "success"
            ? "已匯出"
            : status === "error"
              ? "失敗"
              : "匯出"}
        </span>
      </button>

      {isOpen ? (
        <>
          <button
            type="button"
            className="menu-backdrop"
            aria-label="關閉匯出選單"
            onClick={() => closeMenu()}
          />
          <div id={menuId} role="menu" className="action-menu">
            <button
              ref={firstItemRef}
              type="button"
              role="menuitem"
              onClick={() =>
                download(
                  `\uFEFF${historyToCsv(history)}`,
                  "text/csv;charset=utf-8",
                  "csv",
                )
              }
            >
              <FileSpreadsheet className="h-4 w-4" aria-hidden />
              下載 CSV
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() =>
                download(
                  JSON.stringify(history, null, 2),
                  "application/json;charset=utf-8",
                  "json",
                )
              }
            >
              <Braces className="h-4 w-4" aria-hidden />
              下載 JSON
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={async () => {
                try {
                  await copyText(historyToCsv(history));
                  closeMenu();
                  flashStatus("success");
                } catch {
                  flashStatus("error");
                }
              }}
            >
              <ClipboardCopy className="h-4 w-4" aria-hidden />
              複製 CSV
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
