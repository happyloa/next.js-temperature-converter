import { describe, expect, it } from "vitest";

import {
  TEMPERATURE_SCALES,
  createConversions,
  getMinimumTemperature,
  getScale,
  getTemperatureRange,
  getThermalInsights,
  getThermalMood,
} from "./temperature";

describe("temperature conversion", () => {
  it("converts the Celsius freezing point into every supported scale", () => {
    const celsius = getScale("celsius");
    const results = createConversions(celsius, 0);
    const valueFor = (code: string) =>
      results.find((item) => item.code === code)?.result;

    expect(valueFor("celsius")).toBeCloseTo(0);
    expect(valueFor("fahrenheit")).toBeCloseTo(32);
    expect(valueFor("kelvin")).toBeCloseTo(273.15);
    expect(valueFor("rankine")).toBeCloseTo(491.67);
    expect(valueFor("reaumur")).toBeCloseTo(0);
    expect(valueFor("newton")).toBeCloseTo(0);
  });

  it("round-trips each scale through Kelvin", () => {
    for (const scale of TEMPERATURE_SCALES) {
      expect(scale.fromKelvin(scale.toKelvin(25))).toBeCloseTo(25, 8);
    }
  });

  it("returns physical minimums and scenario-specific slider ranges", () => {
    const celsius = getScale("celsius");
    const fahrenheit = getScale("fahrenheit");

    expect(getMinimumTemperature(celsius)).toBeCloseTo(-273.15);
    expect(getMinimumTemperature(fahrenheit)).toBeCloseTo(-459.67);
    expect(getTemperatureRange(celsius, "daily")).toEqual({
      min: -50,
      max: 60,
      step: 0.25,
    });
    expect(getTemperatureRange(celsius, "cooking")).toEqual({
      min: -50,
      max: 300,
      step: 0.5,
    });
  });

  it("classifies sub-zero temperatures as below freezing", () => {
    expect(getThermalMood(-5).title).toBe("冰點以下");
    expect(getThermalMood(20).title).toBe("舒適區間");
    expect(getThermalMood(Number.NaN).title).toBe("等待輸入");
  });

  it("builds comparison insights only for finite temperatures", () => {
    expect(getThermalInsights(25).map((item) => item.title)).toEqual([
      "舒適區間",
      "比冰點高 25°C",
      "距離沸點還差 75°C",
    ]);
    expect(getThermalInsights(Number.NaN)).toEqual([]);
  });

  it("returns no conversions for a non-finite value", () => {
    expect(createConversions(getScale("celsius"), Number.NaN)).toEqual([]);
  });
});
