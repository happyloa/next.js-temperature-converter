import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HISTORY_STORAGE_KEY } from "../lib/history";
import type { HistoryEntry } from "../types/history";
import { useHistoryStore } from "./useHistoryStore";

const createEntry = (id: string): HistoryEntry => ({
  id,
  timestamp: "2026-07-10T04:00:00.000Z",
  scale: "celsius",
  scaleLabel: "攝氏",
  scaleSymbol: "°C",
  value: Number(id),
  conversions: [
    {
      code: "celsius",
      label: "攝氏",
      symbol: "°C",
      result: Number(id),
    },
  ],
});

describe("useHistoryStore", () => {
  it("restores stored history and clears both state and storage", async () => {
    localStorage.setItem(
      HISTORY_STORAGE_KEY,
      JSON.stringify([createEntry("1")]),
    );
    const { result } = renderHook(() => useHistoryStore());

    await waitFor(() => expect(result.current.history).toHaveLength(1));
    act(() => result.current.clearHistory());

    await waitFor(() => expect(result.current.history).toEqual([]));
    await waitFor(() =>
      expect(localStorage.getItem(HISTORY_STORAGE_KEY)).toBeNull(),
    );
    expect(sessionStorage.getItem(HISTORY_STORAGE_KEY)).toBeNull();
  });

  it("keeps only the eight newest entries", async () => {
    const { result } = renderHook(() => useHistoryStore());

    await act(async () => {
      await Promise.resolve();
    });
    act(() => {
      for (let index = 0; index < 10; index += 1) {
        result.current.addHistoryEntry(createEntry(`${index}`));
      }
    });

    expect(result.current.history.map((entry) => entry.id)).toEqual([
      "9",
      "8",
      "7",
      "6",
      "5",
      "4",
      "3",
      "2",
    ]);
    await waitFor(() =>
      expect(
        JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) ?? "[]"),
      ).toHaveLength(8),
    );
  });
});
