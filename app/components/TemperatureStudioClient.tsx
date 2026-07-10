"use client";

import type { ChangeEvent } from "react";
import { useCallback, useState } from "react";

import { useHistoryStore } from "../hooks/useHistoryStore";
import { useTemperatureConversion } from "../hooks/useTemperatureConversion";
import { copyText } from "../lib/clipboard";
import { formatTemperature, timeFormatter } from "../lib/format";
import {
  TEMPERATURE_PRESETS,
  TEMPERATURE_RANGE_OPTIONS,
  TEMPERATURE_SCALES,
} from "../lib/temperature";
import type { TemperatureScaleCode } from "../types/temperature";
import { HeroSection } from "./HeroSection";
import { HistorySection } from "./HistorySection";
import { InsightsSection } from "./InsightsSection";
import { TemperatureInputCard } from "./TemperatureInputCard";

export function TemperatureStudioClient() {
  const {
    scale,
    rawInput,
    activeScale,
    conversions,
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
    handleSliderChange: updateSliderValue,
    handleReset,
    handlePresetSelect,
    createHistoryEntry,
  } = useTemperatureConversion();
  const { history, addHistoryEntry, clearHistory } = useHistoryStore();
  const [copiedScale, setCopiedScale] = useState<TemperatureScaleCode | null>(
    null,
  );

  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      handleRawInputChange(event.target.value);
    },
    [handleRawInputChange],
  );

  const handleSliderChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      updateSliderValue(Number(event.target.value));
    },
    [updateSliderValue],
  );

  const handleAddHistory = useCallback(() => {
    const entry = createHistoryEntry();
    if (entry) addHistoryEntry(entry);
  }, [addHistoryEntry, createHistoryEntry]);

  const handleCopy = useCallback(
    async (text: string, code: TemperatureScaleCode) => {
      try {
        await copyText(text);
        setCopiedScale(code);
        window.setTimeout(() => setCopiedScale(null), 1800);
      } catch (error) {
        console.error("Failed to copy", error);
      }
    },
    [],
  );

  return (
    <main id="main-content" className="page-shell">
      <div className="workspace-shell">
        <HeroSection
          presets={TEMPERATURE_PRESETS}
          onPresetSelect={handlePresetSelect}
        />

        <div className="converter-layout">
          <TemperatureInputCard
            scale={scale}
            scales={TEMPERATURE_SCALES}
            onScaleChange={handleScaleChange}
            rawInput={rawInput}
            onInputChange={handleInputChange}
            activeSymbol={activeScale?.symbol}
            onReset={handleReset}
            onAddHistory={handleAddHistory}
            canAddHistory={canAddHistory}
            sliderRange={sliderRange}
            sliderValue={sliderValue}
            sliderStep={sliderStep}
            sliderOutOfRange={sliderOutOfRange}
            rangeMode={rangeMode}
            rangeOptions={TEMPERATURE_RANGE_OPTIONS}
            onRangeModeChange={setRangeMode}
            validationError={validationError}
            onSliderChange={handleSliderChange}
            conversions={conversions}
            copiedScale={copiedScale}
            onCopy={handleCopy}
            mood={mood}
            relativeSolarProgress={relativeSolarProgress}
            solarTemperatureRatio={solarTemperatureRatio}
            showSolarProgress={showSolarProgress}
            formatTemperature={formatTemperature}
          />

          <aside className="converter-sidebar">
            <InsightsSection insights={insights} />
            <HistorySection
              history={history}
              onClearHistory={clearHistory}
              formatTemperature={formatTemperature}
              formatTime={(date) => timeFormatter.format(date)}
            />
          </aside>
        </div>
      </div>
    </main>
  );
}
