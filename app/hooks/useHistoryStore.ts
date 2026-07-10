"use client";

import {
  startTransition,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { HISTORY_STORAGE_KEY, parseHistoryPayload } from "../lib/history";
import { readWithFallback, writeWithFallback } from "../lib/storage";
import type { HistoryEntry } from "../types/history";

/**
 * 封裝歷史紀錄的讀寫，包含 localStorage 與 sessionStorage 的 fallback 邏輯。
 */
export function useHistoryStore() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const storageRef = useRef<"local" | "session">("local");

  useEffect(() => {
    const restored = readWithFallback(HISTORY_STORAGE_KEY, parseHistoryPayload);

    if (restored) {
      startTransition(() => setHistory(restored.data));
      storageRef.current = restored.name;
    }

    startTransition(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !hydrated) {
      return;
    }

    const payload = history.length > 0 ? JSON.stringify(history) : null;
    const succeededWith = writeWithFallback(
      HISTORY_STORAGE_KEY,
      payload,
      storageRef.current,
    );
    if (succeededWith) {
      storageRef.current = succeededWith;
    }
  }, [history, hydrated]);

  const addHistoryEntry = useCallback((entry: HistoryEntry) => {
    setHistory((prev) => [entry, ...prev].slice(0, 8));
  }, []);

  const clearHistory = useCallback(() => setHistory([]), []);

  return {
    history,
    addHistoryEntry,
    clearHistory,
  };
}
