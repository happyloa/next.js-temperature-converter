import { describe, expect, it, vi } from "vitest";

import {
  clamp,
  formatLocalClock,
  formatOptionalMetric,
  formatTemperature,
  formatUtcOffset,
  toInputString,
} from "./format";

describe("format helpers", () => {
  it("formats and normalizes temperature values", () => {
    expect(formatTemperature(1234.567)).toBe("1,234.57");
    expect(toInputString(1.234567)).toBe("1.2346");
    expect(toInputString(Number.NaN)).toBe("");
    expect(clamp(20, 0, 10)).toBe(10);
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it("formats optional metrics and UTC offsets", () => {
    expect(formatOptionalMetric(12.5, "°C")).toBe("12.5°C");
    expect(formatOptionalMetric(Number.NaN, "°C")).toBe("--°C");
    expect(formatUtcOffset("+08:00")).toBe("UTC+08:00");
    expect(formatUtcOffset(null)).toBe("UTC±00:00");
  });

  it("formats valid clocks and safely returns invalid input", () => {
    expect(
      formatLocalClock("2026-07-10T04:30:00.000Z", "Asia/Taipei"),
    ).not.toBe("--");

    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    expect(formatLocalClock("not-a-date", "Asia/Taipei")).toBe("not-a-date");
    expect(consoleSpy).not.toHaveBeenCalled();
  });
});
