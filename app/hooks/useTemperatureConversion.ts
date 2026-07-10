"use client";

import { useCallback, useMemo, useState } from "react";

import {
  SOLAR_SURFACE_K,
  createConversions,
  decimalPattern,
  getMinimumTemperature,
  getScale,
  getTemperatureRange,
  getThermalMood,
} from "../lib/temperature";
import { clamp, formatTemperature, toInputString } from "../lib/format";
import type { HistoryEntry } from "../types/history";
import type { ThermalInsight } from "../types/insight";
import type {
  TemperatureConversion,
  TemperaturePreset,
  TemperatureRangeMode,
  TemperatureScale,
  TemperatureScaleCode,
} from "../types/temperature";

/**
 * 負責處理輸入溫標、數值與轉換結果的自訂 hook。
 * 讓頁面元件專注在排版與資料串接，邏輯則被清楚封裝。
 */
export function useTemperatureConversion(
  initialScale: TemperatureScaleCode = "celsius",
) {
  const [scale, setScale] = useState<TemperatureScaleCode>(initialScale);
  const [value, setValue] = useState<number>(25);
  const [rawInput, setRawInput] = useState<string>("25");
  const [rangeMode, setRangeMode] = useState<TemperatureRangeMode>("daily");

  const activeScale = useMemo<TemperatureScale | undefined>(
    () => getScale(scale),
    [scale],
  );

  const minimumValue = useMemo(() => {
    if (!activeScale) {
      return -273.15;
    }
    return getMinimumTemperature(activeScale);
  }, [activeScale]);

  const validationError = useMemo(() => {
    if (!Number.isFinite(value) || !activeScale) return null;
    if (value < minimumValue - 1e-9) {
      return `不能低於絕對零度（${formatTemperature(minimumValue)} ${activeScale.symbol}）`;
    }
    return null;
  }, [activeScale, minimumValue, value]);

  const sliderRange = useMemo(() => {
    if (!activeScale) {
      return { min: -50, max: 60, step: 0.25 } as const;
    }
    return getTemperatureRange(activeScale, rangeMode);
  }, [activeScale, rangeMode]);

  const conversions = useMemo<TemperatureConversion[]>(() => {
    if (!activeScale || validationError) return [];
    return createConversions(activeScale, value);
  }, [activeScale, validationError, value]);

  const celsiusValue = useMemo(() => {
    const celsiusScale = conversions.find((item) => item.code === "celsius");
    return celsiusScale ? celsiusScale.result : Number.NaN;
  }, [conversions]);

  const kelvinValue = useMemo(() => {
    const kelvinScale = conversions.find((item) => item.code === "kelvin");
    return kelvinScale ? kelvinScale.result : Number.NaN;
  }, [conversions]);

  const mood = useMemo(() => getThermalMood(celsiusValue), [celsiusValue]);

  const insights = useMemo<ThermalInsight[]>(() => {
    if (!Number.isFinite(celsiusValue)) return [];

    const freezeDelta = celsiusValue - 0;
    const boilDelta = celsiusValue - 100;

    return [
      {
        icon: mood.emoji,
        title: mood.title,
        description: mood.description,
      },
      {
        icon: freezeDelta >= 0 ? "💧" : "🧊",
        title:
          freezeDelta >= 0
            ? `比冰點高 ${formatTemperature(Math.abs(freezeDelta))}°C`
            : `比冰點低 ${formatTemperature(Math.abs(freezeDelta))}°C`,
        description:
          freezeDelta >= 0
            ? "以純水、標準氣壓為基準；實際相態仍會受壓力與溶質影響。"
            : "以純水、標準氣壓為基準；低於冰點不代表所有液體都會結凍。",
      },
      {
        icon: boilDelta >= 0 ? "♨️" : "🌡️",
        title:
          boilDelta >= 0
            ? `超過沸點 ${formatTemperature(Math.abs(boilDelta))}°C`
            : `距離沸點還差 ${formatTemperature(Math.abs(boilDelta))}°C`,
        description:
          boilDelta >= 0
            ? "高於純水的標準沸點；實際沸點與相態仍取決於壓力與成分。"
            : "以純水、標準氣壓為基準；海拔與溶質都會改變實際沸點。",
      },
    ];
  }, [celsiusValue, mood]);

  const handleScaleChange = useCallback(
    (nextScale: TemperatureScaleCode) => {
      if (!nextScale || nextScale === scale) return;
      const nextScaleConfig = getScale(nextScale);
      if (!nextScaleConfig || !activeScale) {
        setScale(nextScale);
        return;
      }

      if (!Number.isFinite(value)) {
        setScale(nextScale);
        setRawInput("");
        setValue(Number.NaN);
        return;
      }

      const kelvin = activeScale.toKelvin(value);
      const converted = nextScaleConfig.fromKelvin(kelvin);
      setScale(nextScale);
      setValue(converted);
      setRawInput(toInputString(converted));
    },
    [activeScale, scale, value],
  );

  const handleRawInputChange = useCallback((nextValue: string) => {
    if (!decimalPattern.test(nextValue)) return;
    setRawInput(nextValue);

    if (
      nextValue === "" ||
      nextValue === "-" ||
      nextValue === "-." ||
      nextValue === "."
    ) {
      setValue(Number.NaN);
      return;
    }

    const numeric = Number(nextValue);
    if (Number.isNaN(numeric)) {
      setValue(Number.NaN);
      return;
    }

    setValue(numeric);
  }, []);

  const handleSliderChange = useCallback((numeric: number) => {
    if (!Number.isFinite(numeric)) return;
    setValue(numeric);
    setRawInput(toInputString(numeric));
  }, []);

  const handleReset = useCallback(() => {
    setScale("celsius");
    setValue(25);
    setRawInput("25");
  }, []);

  const handlePresetSelect = useCallback((preset: TemperaturePreset) => {
    setScale(preset.scale);
    setValue(preset.value);
    setRawInput(toInputString(preset.value));
  }, []);

  /**
   * 將當前轉換狀態封裝成歷史紀錄，供外部儲存。
   */
  const createHistoryEntry = useCallback((): HistoryEntry | null => {
    if (
      !Number.isFinite(value) ||
      !Number.isFinite(celsiusValue) ||
      conversions.length === 0 ||
      !activeScale
    ) {
      return null;
    }

    return {
      id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      timestamp: new Date().toISOString(),
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
  }, [activeScale, celsiusValue, conversions, scale, value]);

  const sliderValue = Number.isFinite(value)
    ? clamp(value, sliderRange.min, sliderRange.max)
    : clamp(25, sliderRange.min, sliderRange.max);

  const sliderStep = sliderRange.step;

  const sliderOutOfRange =
    Number.isFinite(value) &&
    (value < sliderRange.min || value > sliderRange.max);

  const solarTemperatureRatio = Number.isFinite(kelvinValue)
    ? Math.max((kelvinValue / SOLAR_SURFACE_K) * 100, 0)
    : 0;

  const relativeSolarProgress = clamp(solarTemperatureRatio, 0, 100);

  const showSolarProgress = Number.isFinite(kelvinValue);

  const canAddHistory =
    Number.isFinite(value) &&
    Number.isFinite(celsiusValue) &&
    conversions.length > 0 &&
    !validationError;

  return {
    scale,
    rawInput,
    value,
    activeScale,
    conversions,
    celsiusValue,
    kelvinValue,
    sliderRange,
    sliderValue,
    sliderStep,
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
