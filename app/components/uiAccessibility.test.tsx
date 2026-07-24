import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ExportButton } from "./ExportButton";
import { ConversionResults } from "./temperature/ConversionResults";
import type { HistoryEntry } from "../types/history";

const history: HistoryEntry[] = [
  {
    id: "entry-1",
    timestamp: "2026-07-25T12:00:00.000Z",
    scale: "celsius",
    scaleLabel: "攝氏 (°C)",
    scaleSymbol: "°C",
    value: 25,
    conversions: [],
  },
];

describe("UI accessibility feedback", () => {
  it("uses a labelled action group instead of incomplete menu semantics", () => {
    render(<ExportButton history={history} />);

    fireEvent.click(screen.getByRole("button", { name: "匯出" }));

    expect(screen.getByRole("group", { name: "匯出選項" })).toBeTruthy();
    expect(screen.queryByRole("menu")).toBeNull();
    expect(document.querySelector('button[aria-hidden="true"]')).toHaveProperty(
      "tabIndex",
      -1,
    );
  });

  it("announces the copied conversion to assistive technology", () => {
    render(
      <ConversionResults
        scale="celsius"
        conversions={[
          {
            code: "fahrenheit",
            label: "華氏 (°F)",
            symbol: "°F",
            result: 77,
            toKelvin: vi.fn(),
            fromKelvin: vi.fn(),
          },
        ]}
        copiedScale="fahrenheit"
        validationError={null}
        mood={{ title: "舒適區間", description: "", emoji: "🙂" }}
        onCopy={vi.fn()}
      />,
    );

    expect(
      screen
        .getAllByRole("status")
        .some((status) => status.textContent === "已複製華氏 (°F)結果。"),
    ).toBe(true);
  });
});
