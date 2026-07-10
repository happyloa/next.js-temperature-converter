"use client";

import { useState } from "react";

import { useHistoryStore } from "../hooks/useHistoryStore";
import { useTemperatureConversion } from "../hooks/useTemperatureConversion";
import { copyText } from "../lib/clipboard";
import { formatTemperature, timeFormatter } from "../lib/format";
import { TEMPERATURE_PRESETS } from "../lib/temperature";
import { ui } from "../lib/uiStyles";
import type { TemperatureScaleCode } from "../types/temperature";
import { HeroSection } from "./HeroSection";
import { HistorySection } from "./HistorySection";
import { InsightsSection } from "./InsightsSection";
import { TemperatureInputCard } from "./TemperatureInputCard";

export function TemperatureStudioClient() {
  const converter = useTemperatureConversion();
  const { history, addHistoryEntry, clearHistory } = useHistoryStore();
  const [copiedScale, setCopiedScale] = useState<TemperatureScaleCode | null>(
    null,
  );

  const handleAddHistory = () => {
    const entry = converter.createHistoryEntry();
    if (entry) addHistoryEntry(entry);
  };

  const handleCopy = async (text: string, code: TemperatureScaleCode) => {
    try {
      await copyText(text);
      setCopiedScale(code);
      window.setTimeout(() => setCopiedScale(null), 1800);
    } catch (error) {
      console.error("Failed to copy", error);
    }
  };

  return (
    <main id="main-content" className={ui.pageShell}>
      <div className={ui.workspace}>
        <HeroSection
          presets={TEMPERATURE_PRESETS}
          onPresetSelect={converter.handlePresetSelect}
        />

        <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(20rem,0.85fr)] lg:items-start">
          <TemperatureInputCard
            converter={converter}
            onAddHistory={handleAddHistory}
            copiedScale={copiedScale}
            onCopy={handleCopy}
          />

          <aside className="flex min-w-0 flex-col gap-5 lg:sticky lg:top-19">
            <InsightsSection insights={converter.insights} />
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
