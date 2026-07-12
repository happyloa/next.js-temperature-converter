import { describe, expect, it } from "vitest";

import type { HistoryEntry } from "../types/history";
import { historyToCsv } from "./export";
import { parseHistoryPayload } from "./history";

const historyEntry: HistoryEntry = {
  id: "entry-1",
  timestamp: "2026-07-10T04:00:00.000Z",
  scale: "celsius",
  scaleLabel: "攝氏",
  scaleSymbol: "°C",
  value: 1234.5,
  conversions: [
    {
      code: "celsius",
      label: "攝氏",
      symbol: "°C",
      result: 1234.5,
    },
    {
      code: "fahrenheit",
      label: "華氏",
      symbol: "°F",
      result: 2254.1,
    },
  ],
};

describe("history payload and export", () => {
  it("treats an empty history as a valid stored value", () => {
    expect(parseHistoryPayload([])).toEqual([]);
  });

  it("keeps valid entries and filters malformed records", () => {
    expect(parseHistoryPayload([historyEntry, { id: 1 }])).toEqual([
      historyEntry,
    ]);
    expect(parseHistoryPayload({})).toBeNull();
  });

  it("filters invalid dates and non-finite numeric values", () => {
    expect(
      parseHistoryPayload([
        { ...historyEntry, timestamp: "not-a-date" },
        { ...historyEntry, value: Number.POSITIVE_INFINITY },
        {
          ...historyEntry,
          conversions: [{ ...historyEntry.conversions[0], result: Number.NaN }],
        },
      ]),
    ).toEqual([]);
  });

  it("exports raw numeric values without locale thousands separators", () => {
    const csv = historyToCsv([historyEntry]);

    expect(csv).toContain("攝氏 (°C),華氏 (°F)");
    expect(csv).toContain("1234.5,2254.1");
    expect(csv).not.toContain('"1,234.5"');
    expect(historyToCsv([])).toBe("");
  });
});
