"use client";

import type { ChangeEvent } from "react";
import { useCallback, useState } from "react";

import { HeroSection } from "./components/HeroSection";
import { HistorySection } from "./components/HistorySection";
import { InsightsSection } from "./components/InsightsSection";
import { KeyboardShortcutsHelp } from "./components/KeyboardShortcutsHelp";
import { TemperatureInputCard } from "./components/TemperatureInputCard";
import { useHistoryStore } from "./hooks/useHistoryStore";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useTemperatureConversion } from "./hooks/useTemperatureConversion";
import { useTheme } from "./components/ThemeProvider";
import { TEMPERATURE_PRESETS, TEMPERATURE_SCALES } from "./lib/temperature";
import { formatTemperature, timeFormatter } from "./lib/format";
import type { TemperatureScaleCode } from "./types/temperature";

/**
 * Next.js App Router 頁面：整合溫度轉換、歷史紀錄與環境儀表板。
 */
export default function TemperatureStudio() {
  const {
    scale,
    rawInput,
    activeScale,
    conversions,
    sliderRange,
    sliderValue,
    sliderStep,
    mood,
    insights,
    relativeSolarProgress,
    showSolarProgress,
    canAddHistory,
    handleScaleChange,
    handleRawInputChange,
    handleSliderChange: updateSliderValue,
    handleReset,
    handlePresetSelect: selectTemperaturePreset,
    createHistoryEntry,
  } = useTemperatureConversion();

  const { history, addHistoryEntry, clearHistory } = useHistoryStore();
  const { toggleTheme } = useTheme();

  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);

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

  const handlePresetClick = selectTemperaturePreset;

  const handleAddHistory = useCallback(() => {
    const entry = createHistoryEntry();
    if (!entry) return;
    addHistoryEntry(entry);
  }, [addHistoryEntry, createHistoryEntry]);

  const handleClearHistory = useCallback(() => {
    clearHistory();
  }, [clearHistory]);

  const handleCopy = useCallback(
    async (text: string, code: TemperatureScaleCode) => {
      try {
        await navigator.clipboard?.writeText(text);
        setCopiedScale(code);
        setTimeout(() => setCopiedScale(null), 1800);
      } catch (error) {
        console.error("Failed to copy", error);
      }
    },
    [],
  );

  // 鍵盤快捷鍵設定
  useKeyboardShortcuts({
    shortcuts: [
      {
        key: "r",
        alt: true,
        action: handleReset,
        description: "重設溫度輸入",
      },
      {
        key: "h",
        alt: true,
        action: clearHistory,
        description: "清除歷史紀錄",
      },
      {
        key: "t",
        alt: true,
        action: toggleTheme,
        description: "切換主題",
      },
      {
        key: "?",
        action: () => setShowShortcutsHelp((prev) => !prev),
        description: "顯示快捷鍵說明",
      },
      {
        key: "Escape",
        action: () => setShowShortcutsHelp(false),
        description: "關閉彈窗",
      },
    ],
  });

  return (
    <main className="w-full max-w-full py-12 pb-24">
      <div className="mx-auto flex w-full min-w-0 max-w-[1600px] flex-col gap-10 px-4 sm:px-6 lg:px-10">
        <HeroSection
          presets={TEMPERATURE_PRESETS}
          onPresetSelect={handlePresetClick}
        />

        <div className="grid min-w-0 gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Main Content Area (7/12) */}
          <div className="flex min-w-0 flex-col gap-8 lg:col-span-7">
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
              onSliderChange={handleSliderChange}
              conversions={conversions}
              copiedScale={copiedScale}
              onCopy={handleCopy}
              mood={mood}
              relativeSolarProgress={relativeSolarProgress}
              showSolarProgress={showSolarProgress}
              formatTemperature={formatTemperature}
            />
          </div>

          {/* Sidebar Area (5/12) */}
          <aside className="flex min-w-0 flex-col gap-8 lg:col-span-5">
            <InsightsSection insights={insights} />

            <HistorySection
              history={history}
              onClearHistory={handleClearHistory}
              formatTemperature={formatTemperature}
              formatTime={(date) => timeFormatter.format(date)}
            />
          </aside>
        </div>
      </div>

      <KeyboardShortcutsHelp
        isOpen={showShortcutsHelp}
        onOpenChange={setShowShortcutsHelp}
        shortcuts={[
          { keys: "Alt+R", description: "重設溫度輸入" },
          { keys: "Alt+H", description: "清除歷史紀錄" },
          { keys: "Alt+T", description: "切換深淺色主題" },
          { keys: "?", description: "顯示/隱藏快捷鍵說明" },
          { keys: "Esc", description: "關閉彈窗" },
        ]}
      />
    </main>
  );
}
