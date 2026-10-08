import { Plus, RotateCcw } from "lucide-react";

import type { useTemperatureConversion } from "../hooks/useTemperatureConversion";
import { formatTemperature } from "../lib/format";
import { TEMPERATURE_RANGE_OPTIONS } from "../lib/temperature";
import { ui } from "../lib/uiStyles";
import { cn, handleRadioGroupKeyDown } from "../lib/utils";
import type { TemperatureScaleCode } from "../types/temperature";
import { ShareButton } from "./ShareButton";
import { ConversionResults } from "./temperature/ConversionResults";
import { ScaleSelector } from "./temperature/ScaleSelector";
import { SolarComparison } from "./temperature/SolarComparison";

type TemperatureInputCardProps = {
  converter: ReturnType<typeof useTemperatureConversion>;
  copiedScale: TemperatureScaleCode | null;
  onCopy: (text: string, code: TemperatureScaleCode) => void | Promise<void>;
  onAddHistory: () => void;
};

export function TemperatureInputCard({
  converter,
  copiedScale,
  onCopy,
  onAddHistory,
}: TemperatureInputCardProps) {
  const {
    scale,
    rawInput,
    activeScale,
    conversions,
    sliderRange,
    sliderValue,
    sliderOutOfRange,
    rangeMode,
    setRangeMode,
    validationError,
    mood,
    relativeSolarProgress,
    solarTemperatureRatio,
    showSolarProgress,
    canAddHistory,
    handleScaleChange,
    handleRawInputChange,
    handleSliderChange,
    handleReset,
  } = converter;
  const activeSymbol = activeScale?.symbol;
  const shareText = conversions
    .map(
      (conversion) =>
        `${conversion.label}: ${formatTemperature(conversion.result)} ${conversion.symbol}`,
    )
    .join("\n");

  return (
    <section
      className={cn(ui.panel, "p-5 sm:p-7")}
      aria-labelledby="converter-title"
    >
      <header className="flex min-w-0 flex-col justify-between gap-4 border-b border-edge-subtle pb-5 sm:flex-row sm:items-center">
        <div>
          <h2 id="converter-title" className={ui.sectionTitle}>
            輸入與結果
          </h2>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center max-[430px]:grid-cols-2">
          <ShareButton
            title="溫度工作室 - 轉換結果"
            text={shareText || "使用溫度工作室進行溫度轉換"}
            className="min-w-0"
          />
          <button
            type="button"
            onClick={handleReset}
            className={cn(ui.button, ui.secondaryButton, "min-w-0")}
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            重設
          </button>
          <button
            type="button"
            onClick={onAddHistory}
            disabled={!canAddHistory}
            className={cn(
              ui.button,
              ui.primaryButton,
              "min-w-0 max-[430px]:col-span-2",
            )}
          >
            <Plus className="h-4 w-4" aria-hidden />
            加入紀錄
          </button>
        </div>
      </header>

      <ScaleSelector activeScale={scale} onScaleChange={handleScaleChange} />

      <div className="mt-7">
        <label className="block min-w-0">
          <span className={ui.fieldLabel}>輸入數值</span>
          <span
            className={cn(
              "mt-2 flex min-h-28 w-full min-w-0 items-baseline gap-3 border-b-2 bg-surface-medium px-4 py-5 focus-within:border-accent-label sm:px-5",
              validationError ? "border-error-border" : "border-edge-strong",
            )}
          >
            <input
              type="text"
              inputMode="decimal"
              value={rawInput}
              onChange={(event) => handleRawInputChange(event.target.value)}
              maxLength={64}
              placeholder="例如 25"
              aria-invalid={Boolean(validationError)}
              aria-describedby="temperature-input-help"
              className={cn(
                "w-full min-w-0 border-0 bg-transparent font-normal leading-none tracking-[-0.06em] text-ink-strong outline-0",
                rawInput.length > 8
                  ? "text-2xl sm:text-3xl"
                  : "text-[3.5rem] sm:text-[5.5rem]",
              )}
            />
            <span className="shrink-0 text-3xl font-normal text-accent-label sm:text-5xl">
              {activeSymbol ?? ""}
            </span>
          </span>
        </label>
        <p
          id="temperature-input-help"
          role={validationError ? "alert" : undefined}
          className={cn(ui.fieldHelp, validationError && "text-error-ink")}
        >
          {validationError ?? "可直接輸入小數；物理下限為絕對零度。"}
        </p>

        <div className="mt-6 flex min-w-0 items-center justify-between gap-4 max-[760px]:flex-col max-[760px]:items-stretch">
          <div className="min-w-0">
            <span className={ui.fieldLabel}>滑桿範圍</span>
            <p className={ui.fieldHelp}>
              {formatTemperature(sliderRange.min)} 至{" "}
              {formatTemperature(sliderRange.max)} {activeSymbol}
            </p>
          </div>
          <div
            role="radiogroup"
            aria-label="滑桿使用情境"
            className={ui.rangeControl}
            onKeyDown={(event) =>
              handleRadioGroupKeyDown(
                event,
                TEMPERATURE_RANGE_OPTIONS.map((item) => item.code),
                rangeMode,
                setRangeMode,
              )
            }
          >
            {TEMPERATURE_RANGE_OPTIONS.map((option) => (
              <button
                key={option.code}
                type="button"
                role="radio"
                aria-checked={rangeMode === option.code}
                data-radio-value={option.code}
                tabIndex={rangeMode === option.code ? 0 : -1}
                title={option.description}
                onClick={() => setRangeMode(option.code)}
                className={cn(
                  ui.rangeButton,
                  rangeMode === option.code
                    ? ui.rangeButtonActive
                    : "bg-surface-strong text-ink-subtle",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <input
          type="range"
          min={sliderRange.min}
          max={sliderRange.max}
          step={sliderRange.step}
          value={sliderValue}
          onChange={(event) => handleSliderChange(Number(event.target.value))}
          aria-label={`溫度滑桿，單位 ${activeSymbol ?? ""}`}
          className="mt-3 h-5 w-full accent-accent"
        />
        {sliderOutOfRange ? (
          <p className={ui.fieldHelp}>
            目前輸入超出此滑桿情境，但轉換結果仍使用完整輸入值。
          </p>
        ) : null}
      </div>

      <ConversionResults
        scale={scale}
        conversions={conversions}
        copiedScale={copiedScale}
        validationError={validationError}
        mood={mood}
        onCopy={onCopy}
      />

      <SolarComparison
        progress={relativeSolarProgress}
        ratio={solarTemperatureRatio}
        showProgress={showSolarProgress}
      />
    </section>
  );
}
