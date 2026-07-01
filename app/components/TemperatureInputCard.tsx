import type { ChangeEventHandler, MouseEventHandler } from "react";

import type {
  TemperatureConversion,
  TemperatureScale,
  TemperatureScaleCode,
  ThermalMood,
} from "../types/temperature";
import { cn } from "../lib/utils";
import { ShareButton } from "./ShareButton";

type TemperatureInputCardProps = {
  scale: TemperatureScaleCode;
  scales: TemperatureScale[];
  onScaleChange: (code: TemperatureScaleCode) => void;
  rawInput: string;
  onInputChange: ChangeEventHandler<HTMLInputElement>;
  activeSymbol?: string;
  onReset: MouseEventHandler<HTMLButtonElement>;
  onAddHistory: MouseEventHandler<HTMLButtonElement>;
  canAddHistory: boolean;
  sliderRange: { min: number; max: number };
  sliderValue: number;
  sliderStep: number;
  onSliderChange: ChangeEventHandler<HTMLInputElement>;
  conversions: TemperatureConversion[];
  copiedScale: TemperatureScaleCode | null;
  onCopy: (text: string, code: TemperatureScaleCode) => void | Promise<void>;
  mood: ThermalMood | null;
  relativeSolarProgress: number;
  showSolarProgress: boolean;
  formatTemperature: (value: number) => string;
};

/**
 * 溫度輸入主卡片，整合切換按鈕、輸入欄位與轉換結果。
 */
export function TemperatureInputCard({
  scale,
  scales,
  onScaleChange,
  rawInput,
  onInputChange,
  activeSymbol,
  onReset,
  onAddHistory,
  canAddHistory,
  sliderRange,
  sliderValue,
  sliderStep,
  onSliderChange,
  conversions,
  copiedScale,
  onCopy,
  mood,
  relativeSolarProgress,
  showSolarProgress,
  formatTemperature,
}: TemperatureInputCardProps) {
  // Generate share text from conversions
  const shareText =
    conversions.length > 0
      ? conversions
          .map((c) => `${c.label}: ${formatTemperature(c.result)} ${c.symbol}`)
          .join("\n")
      : undefined;

  return (
    <section className="w-full min-w-0 space-y-8 rounded-3xl border border-slate-700/40 bg-slate-900/70 p-5 shadow-glass backdrop-blur sm:p-6 md:p-8">
      <TemperatureCardHeader
        onReset={onReset}
        onAddHistory={onAddHistory}
        canAddHistory={canAddHistory}
        shareText={shareText}
      />

      <TemperatureScaleSelector
        activeScale={scale}
        scales={scales}
        onScaleChange={onScaleChange}
      />

      <div className="space-y-5">
        <TemperatureValueField
          rawInput={rawInput}
          onInputChange={onInputChange}
          activeSymbol={activeSymbol}
        />
        <TemperatureSliderControl
          sliderRange={sliderRange}
          sliderValue={sliderValue}
          sliderStep={sliderStep}
          onSliderChange={onSliderChange}
          formatTemperature={formatTemperature}
        />
      </div>

      <ConversionResultGrid
        conversions={conversions}
        copiedScale={copiedScale}
        onCopy={onCopy}
        mood={mood}
        formatTemperature={formatTemperature}
      />

      <SolarProgressPanel
        relativeSolarProgress={relativeSolarProgress}
        showSolarProgress={showSolarProgress}
        formatTemperature={formatTemperature}
      />
    </section>
  );
}

type TemperatureCardHeaderProps = {
  onReset: MouseEventHandler<HTMLButtonElement>;
  onAddHistory: MouseEventHandler<HTMLButtonElement>;
  canAddHistory: boolean;
  shareText?: string;
};

/**
 * 卡片標題與操作列，包含重設與加入紀錄兩個主要動作。
 */
function TemperatureCardHeader({
  onReset,
  onAddHistory,
  canAddHistory,
  shareText,
}: TemperatureCardHeaderProps) {
  return (
    <header className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:[&>*]:min-w-0">
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-50">輸入溫度</h2>
        <p className="max-w-xl text-sm leading-relaxed text-slate-300">
          選擇想要輸入的溫標後填入數值，系統會即時計算其他尺度並提供安全洞察與轉換紀錄。
        </p>
      </div>
      <div className="flex flex-wrap justify-end gap-3">
        <ShareButton
          title="溫度工作室 - 轉換結果"
          text={shareText || "使用溫度工作室進行溫度轉換"}
        />
        <button
          type="button"
          onClick={onReset}
          className="theme-outline-button"
        >
          🔄 重設
        </button>
        <button
          type="button"
          onClick={onAddHistory}
          disabled={!canAddHistory}
          className="theme-primary-button px-6"
        >
          📝 加入紀錄
        </button>
      </div>
    </header>
  );
}

type TemperatureScaleSelectorProps = {
  activeScale: TemperatureScaleCode;
  scales: TemperatureScale[];
  onScaleChange: (code: TemperatureScaleCode) => void;
};

/**
 * 溫標切換群組，採 segment 按鈕呈現。
 */
function TemperatureScaleSelector({
  activeScale,
  scales,
  onScaleChange,
}: TemperatureScaleSelectorProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {scales.map((item) => (
        <button
          key={item.code}
          type="button"
          onClick={() => onScaleChange(item.code)}
          className={cn(
            "theme-segment",
            activeScale === item.code ? "theme-segment--active" : "",
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

type TemperatureValueFieldProps = {
  rawInput: string;
  onInputChange: ChangeEventHandler<HTMLInputElement>;
  activeSymbol?: string;
};

/**
 * 輸入欄位，支援鍵盤輸入與手機數字鍵盤。
 */
function TemperatureValueField({
  rawInput,
  onInputChange,
  activeSymbol,
}: TemperatureValueFieldProps) {
  return (
    <label className="flex flex-col gap-2 text-left">
      <span className="text-sm font-semibold text-slate-200">輸入數值</span>
      <div className="flex items-center gap-3 rounded-2xl border border-slate-700/60 bg-slate-900/70 px-4 py-3 text-lg font-semibold text-slate-100 focus-within:border-[#FF5E5B] focus-within:ring-2 focus-within:ring-[#FF5E5B]/40">
        <span className="text-xl">🌡️</span>
        <input
          type="text"
          inputMode="decimal"
          value={rawInput}
          onChange={onInputChange}
          placeholder="輸入溫度值"
          className="flex-1 bg-transparent text-base font-semibold outline-none sm:text-lg"
        />
        <span className="text-sm font-semibold text-slate-400">
          {activeSymbol ?? ""}
        </span>
      </div>
    </label>
  );
}

type TemperatureSliderControlProps = {
  sliderRange: { min: number; max: number };
  sliderValue: number;
  sliderStep: number;
  onSliderChange: ChangeEventHandler<HTMLInputElement>;
  formatTemperature: (value: number) => string;
};

/**
 * 範圍滑桿，提供更直覺的溫度調整方式。
 */
function TemperatureSliderControl({
  sliderRange,
  sliderValue,
  sliderStep,
  onSliderChange,
  formatTemperature,
}: TemperatureSliderControlProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-slate-200">
        範圍滑桿（{formatTemperature(sliderRange.min)} ~{" "}
        {formatTemperature(sliderRange.max)}）
      </span>
      <input
        type="range"
        min={sliderRange.min}
        max={sliderRange.max}
        step={sliderStep}
        value={sliderValue}
        onChange={onSliderChange}
        className="h-2 w-full cursor-grab appearance-none rounded-full bg-slate-800 accent-[#FF5E5B] active:cursor-grabbing"
      />
    </label>
  );
}

type ConversionResultGridProps = {
  conversions: TemperatureConversion[];
  copiedScale: TemperatureScaleCode | null;
  onCopy: (text: string, code: TemperatureScaleCode) => void | Promise<void>;
  mood: ThermalMood | null;
  formatTemperature: (value: number) => string;
};

/**
 * 將所有溫標的換算結果以卡片形式呈現。
 */
function ConversionResultGrid({
  conversions,
  copiedScale,
  onCopy,
  mood,
  formatTemperature,
}: ConversionResultGridProps) {
  return (
    <section className="space-y-4" aria-live="polite">
      <h3 className="text-lg font-semibold text-slate-100">即時轉換結果</h3>
      <ul className="grid gap-4 sm:grid-cols-2 list-none m-0 p-0">
        {conversions.map((item) => (
          <li key={item.code} className="list-none">
            <ConversionResultCard
              conversion={item}
              copiedScale={copiedScale}
              onCopy={onCopy}
              mood={mood}
              formatTemperature={formatTemperature}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

type ConversionResultCardProps = {
  conversion: TemperatureConversion;
  copiedScale: TemperatureScaleCode | null;
  onCopy: (text: string, code: TemperatureScaleCode) => void | Promise<void>;
  mood: ThermalMood | null;
  formatTemperature: (value: number) => string;
};

function ConversionResultCard({
  conversion,
  copiedScale,
  onCopy,
  mood,
  formatTemperature,
}: ConversionResultCardProps) {
  return (
    <div className="relative min-w-0 overflow-hidden rounded-3xl border border-slate-600/30 bg-slate-900/60 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <span className="text-xs uppercase tracking-wide text-slate-200/80">
            {conversion.label}
          </span>
          <p className="text-2xl font-bold text-slate-50 sm:text-3xl">
            {formatTemperature(conversion.result)} {conversion.symbol}
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            onCopy(`${formatTemperature(conversion.result)}`, conversion.code)
          }
          className={cn(
            "theme-outline-button theme-outline-button--small",
            copiedScale === conversion.code
              ? "theme-outline-button--success"
              : "",
          )}
        >
          {copiedScale === conversion.code ? "已複製" : "複製"}
        </button>
      </div>
      {conversion.code === "celsius" && mood ? (
        <p className="mt-3 text-sm text-slate-200/80">{mood.title}</p>
      ) : null}
    </div>
  );
}

type SolarProgressPanelProps = {
  relativeSolarProgress: number;
  showSolarProgress: boolean;
  formatTemperature: (value: number) => string;
};

/**
 * 顯示當前溫度相對於太陽表面的比例，提供視覺化的熱能概念。
 */
function SolarProgressPanel({
  relativeSolarProgress,
  showSolarProgress,
  formatTemperature,
}: SolarProgressPanelProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3 text-slate-200">
        <span className="text-xl">📈</span>
        <h3 className="text-base font-semibold sm:text-lg">
          相對於太陽表面的能量比例
        </h3>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full border border-slate-700/60 bg-slate-800/80">
        <div
          className="h-full bg-orange-500"
          style={{ width: `${relativeSolarProgress}%` }}
        />
      </div>
      <p className="text-xs text-slate-400">
        {showSolarProgress
          ? `目前為太陽表面溫度的 ${formatTemperature(relativeSolarProgress)}%`
          : "輸入溫度以分析熱能比例"}
      </p>
    </div>
  );
}
