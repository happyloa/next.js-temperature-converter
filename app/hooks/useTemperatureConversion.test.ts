import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useTemperatureConversion } from "./useTemperatureConversion";

describe("useTemperatureConversion", () => {
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

  it("only creates history entries for valid conversions", () => {
    const { result } = renderHook(() => useTemperatureConversion());

    expect(result.current.createHistoryEntry()).toMatchObject({
      scale: "celsius",
      value: 25,
    });

    act(() => result.current.handleRawInputChange(""));
    expect(result.current.createHistoryEntry()).toBeNull();
  });
});
