import { Plus, RotateCcw, Thermometer } from "lucide-react";

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
      className={cn(ui.panel, "p-4 sm:p-6")}
      aria-labelledby="converter-title"
    >
      <header className="flex min-w-0 items-start justify-between gap-4 max-[760px]:flex-col max-[760px]:items-stretch">
        <div>
          <p className={ui.kicker}>CONVERTER</p>
          <h2 id="converter-title" className={ui.sectionTitle}>
            輸入與結果
          </h2>
          <p className={ui.description}>
            選擇輸入溫標並填入數值，其他五種尺度會即時更新。
          </p>
        </div>
        <div className="grid w-full grid-cols-3 gap-2 min-[761px]:flex min-[761px]:w-auto min-[761px]:flex-wrap min-[761px]:items-center max-[430px]:grid-cols-2">
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

      <div className="mt-5 border-t border-edge-subtle pt-5">
        <label className="block min-w-0">
          <span className={ui.fieldLabel}>輸入數值</span>
          <span
            className={cn(
              "mt-1.5 flex min-h-13 w-full min-w-0 items-center gap-2.5 rounded-lg border bg-surface-medium px-3 py-2.5 focus-within:border-accent",
              validationError ? "border-error-border" : "border-edge-strong",
            )}
          >
            <Thermometer className="h-5 w-5 shrink-0 text-accent" aria-hidden />
            <input
              type="text"
              inputMode="decimal"
              value={rawInput}
              onChange={(event) => handleRawInputChange(event.target.value)}
              placeholder="例如 25"
              aria-invalid={Boolean(validationError)}
              aria-describedby="temperature-input-help"
              className="w-full min-w-0 border-0 bg-transparent text-xl font-[720] text-ink-strong outline-0 [font-variant-numeric:tabular-nums]"
            />
            <span className="shrink-0 text-sm font-bold text-ink-subtle">
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

        <div className="mt-4 flex min-w-0 items-center justify-between gap-4 max-[760px]:flex-col max-[760px]:items-stretch">
          <div>
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
                    : "text-ink-subtle",
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
          className="mt-2 h-5 w-full accent-accent"
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
