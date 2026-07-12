import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useTemperatureConversion } from "./useTemperatureConversion";

describe("useTemperatureConversion", () => {
  const historyMetadata = {
    id: "test-entry",
    timestamp: "2026-01-01T00:00:00.000Z",
  };

  it("keeps text input values outside the selected slider range", () => {
    const { result } = renderHook(() => useTemperatureConversion());

    act(() => result.current.handleRawInputChange("1000"));

    expect(result.current.value).toBe(1000);
    expect(result.current.sliderValue).toBe(60);
    expect(result.current.sliderOutOfRange).toBe(true);
    expect(
      result.current.conversions.find((item) => item.code === "celsius")
        ?.result,
    ).toBe(1000);
  });

  it("rejects values below absolute zero without silently clamping them", () => {
    const { result } = renderHook(() => useTemperatureConversion());

    act(() => result.current.handleRawInputChange("-300"));

    expect(result.current.rawInput).toBe("-300");
    expect(result.current.value).toBe(-300);
    expect(result.current.validationError).toContain("絕對零度");
    expect(result.current.conversions).toEqual([]);
    expect(result.current.canAddHistory).toBe(false);
  });

  it("preserves the physical temperature when changing scales", () => {
    const { result } = renderHook(() => useTemperatureConversion());

    act(() => result.current.handleScaleChange("fahrenheit"));

    expect(result.current.scale).toBe("fahrenheit");
    expect(result.current.value).toBeCloseTo(77);
    expect(result.current.rawInput).toBe("77");
  });

  it("preserves practical input precision across scale changes", () => {
    const { result } = renderHook(() => useTemperatureConversion());

    act(() => result.current.handleRawInputChange("0.123456"));
    act(() => result.current.handleScaleChange("fahrenheit"));
    act(() => result.current.handleScaleChange("celsius"));

    expect(result.current.rawInput).toBe("0.123456");
  });

  it("rejects non-finite and overflowing conversion values", () => {
    const { result } = renderHook(() => useTemperatureConversion());

    act(() => result.current.handleRawInputChange("9".repeat(400)));
    expect(result.current.validationError).toContain("有限數值");
    expect(result.current.conversions).toEqual([]);
    expect(result.current.canAddHistory).toBe(false);

    act(() => result.current.handleRawInputChange(`1${"0".repeat(308)}`));
    expect(result.current.validationError).toContain("數值過大");
    expect(result.current.createHistoryEntry(historyMetadata)).toBeNull();
  });

  it("only creates history entries for valid conversions", () => {
    const { result } = renderHook(() => useTemperatureConversion());

    expect(result.current.createHistoryEntry(historyMetadata)).toMatchObject({
      ...historyMetadata,
      scale: "celsius",
      value: 25,
    });

    act(() => result.current.handleRawInputChange(""));
    expect(result.current.createHistoryEntry(historyMetadata)).toBeNull();
  });

  it("restores the default scale, value, and slider scenario", () => {
    const { result } = renderHook(() => useTemperatureConversion());

    act(() => {
      result.current.setRangeMode("science");
      result.current.handleScaleChange("fahrenheit");
      result.current.handleRawInputChange("451");
      result.current.handleReset();
    });

    expect(result.current.scale).toBe("celsius");
    expect(result.current.rawInput).toBe("25");
    expect(result.current.rangeMode).toBe("daily");
  });
});
