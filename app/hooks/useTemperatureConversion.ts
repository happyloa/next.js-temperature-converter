"use client";

import { useState } from "react";

import {
  SOLAR_SURFACE_K,
  createConversions,
  decimalPattern,
  getMinimumTemperature,
  getScale,
  getTemperatureRange,
  getThermalInsights,
  getThermalMood,
} from "../lib/temperature";
import { clamp, formatTemperature, toInputString } from "../lib/format";
import type { HistoryEntry } from "../types/history";
import type {
  TemperaturePreset,
  TemperatureRangeMode,
  TemperatureScaleCode,
} from "../types/temperature";

export function useTemperatureConversion(
  initialScale: TemperatureScaleCode = "celsius",
) {
  const [scale, setScale] = useState<TemperatureScaleCode>(initialScale);
  const [rawInput, setRawInput] = useState<string>("25");
  const [rangeMode, setRangeMode] = useState<TemperatureRangeMode>("daily");

  const value = Number.parseFloat(rawInput);
  const activeScale = getScale(scale);
  const minimumValue = getMinimumTemperature(activeScale);
  const validationError =
    Number.isFinite(value) && value < minimumValue - 1e-9
      ? `不能低於絕對零度（${formatTemperature(minimumValue)} ${activeScale.symbol}）`
      : null;
  const sliderRange = getTemperatureRange(activeScale, rangeMode);
  const conversions = !validationError
    ? createConversions(activeScale, value)
    : [];
  const resultFor = (code: TemperatureScaleCode) =>
    conversions.find((item) => item.code === code)?.result ?? Number.NaN;
  const celsiusValue = resultFor("celsius");
  const kelvinValue = resultFor("kelvin");
  const mood = getThermalMood(celsiusValue);
  const insights = getThermalInsights(celsiusValue, mood);

  const handleScaleChange = (nextScale: TemperatureScaleCode) => {
    if (nextScale === scale) return;
    const nextScaleConfig = getScale(nextScale);

    setScale(nextScale);
    if (!Number.isFinite(value)) {
      setRawInput("");
      return;
    }

    const kelvin = activeScale.toKelvin(value);
    setRawInput(toInputString(nextScaleConfig.fromKelvin(kelvin)));
  };

  const handleRawInputChange = (nextValue: string) => {
    if (!decimalPattern.test(nextValue)) return;
    setRawInput(nextValue);
  };

  const handleSliderChange = (numeric: number) => {
    if (!Number.isFinite(numeric)) return;
    setRawInput(toInputString(numeric));
  };

  const handleReset = () => {
    setScale("celsius");
    setRawInput("25");
    setRangeMode("daily");
  };

  const handlePresetSelect = (preset: TemperaturePreset) => {
    setScale(preset.scale);
    setRawInput(toInputString(preset.value));
  };

  const createHistoryEntry = ({
    id,
    timestamp,
  }: Pick<HistoryEntry, "id" | "timestamp">): HistoryEntry | null => {
    if (!conversions.length) return null;

    return {
      id,
      timestamp,
      scale,
      scaleLabel: activeScale.label,
      scaleSymbol: activeScale.symbol,
      value,
      conversions: conversions.map((item) => ({
        code: item.code,
        label: item.label,
        symbol: item.symbol,
        result: item.result,
      })),
    } satisfies HistoryEntry;
  };

  const sliderValue = Number.isFinite(value)
    ? clamp(value, sliderRange.min, sliderRange.max)
    : clamp(25, sliderRange.min, sliderRange.max);

  const sliderOutOfRange =
    Number.isFinite(value) &&
    (value < sliderRange.min || value > sliderRange.max);

  const solarTemperatureRatio = Number.isFinite(kelvinValue)
    ? Math.max((kelvinValue / SOLAR_SURFACE_K) * 100, 0)
    : 0;

  const relativeSolarProgress = clamp(solarTemperatureRatio, 0, 100);

  const showSolarProgress = Number.isFinite(kelvinValue);

  const canAddHistory = conversions.length > 0;

  return {
    scale,
    rawInput,
    value,
    activeScale,
    conversions,
    sliderRange,
    sliderValue,
    sliderOutOfRange,
    rangeMode,
    setRangeMode,
    validationError,
    mood,
    insights,
    relativeSolarProgress,
    solarTemperatureRatio,
    showSolarProgress,
    canAddHistory,
    handleScaleChange,
    handleRawInputChange,
    handleSliderChange,
    handleReset,
    handlePresetSelect,
    createHistoryEntry,
  };
}
