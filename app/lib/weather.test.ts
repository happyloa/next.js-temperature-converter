import { describe, expect, it } from "vitest";

import {
  getEuropeanAqiLevel,
  getUvLevel,
  getWeatherDescription,
  getWeatherIconKind,
} from "./weather";

describe("weather presentation rules", () => {
  it.each([
    [0, "良好"],
    [19, "良好"],
    [20, "尚可"],
    [40, "普通"],
    [60, "不佳"],
    [80, "非常不佳"],
    [100, "極差"],
  ])("maps European AQI %s to %s", (value, label) => {
    expect(getEuropeanAqiLevel(value).label).toBe(label);
  });

  it.each([
    [0, "低"],
    [3, "中等"],
    [6, "高"],
    [8, "很高"],
    [11, "極高"],
  ])("maps UV index %s to %s", (value, label) => {
    expect(getUvLevel(value).label).toBe(label);
  });

  it("maps weather codes to descriptions and icon families", () => {
    expect(getWeatherDescription(0)).toBe("晴朗無雲");
    expect(getWeatherDescription(999)).toContain("不明");
    expect(getWeatherIconKind(0)).toBe("clear");
    expect(getWeatherIconKind(45)).toBe("fog");
    expect(getWeatherIconKind(75)).toBe("snow");
    expect(getWeatherIconKind(95)).toBe("storm");
  });
});
