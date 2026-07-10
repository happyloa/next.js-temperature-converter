import type { ChangeEventHandler, MouseEventHandler } from "react";
import { Check, Copy, Plus, RotateCcw, Thermometer } from "lucide-react";

import { cn, handleRadioGroupKeyDown } from "../lib/utils";
import type {
  TemperatureConversion,
  TemperatureRangeMode,
  TemperatureRangeOption,
  TemperatureScale,
  TemperatureScaleCode,
  ThermalMood,
} from "../types/temperature";
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
  sliderOutOfRange: boolean;
  rangeMode: TemperatureRangeMode;
  rangeOptions: TemperatureRangeOption[];
  onRangeModeChange: (mode: TemperatureRangeMode) => void;
  validationError: string | null;
  onSliderChange: ChangeEventHandler<HTMLInputElement>;
  conversions: TemperatureConversion[];
  copiedScale: TemperatureScaleCode | null;
  onCopy: (text: string, code: TemperatureScaleCode) => void | Promise<void>;
  mood: ThermalMood | null;
  relativeSolarProgress: number;
  solarTemperatureRatio: number;
  showSolarProgress: boolean;
  formatTemperature: (value: number) => string;
};

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
  sliderOutOfRange,
  rangeMode,
  rangeOptions,
  onRangeModeChange,
  validationError,
  onSliderChange,
  conversions,
  copiedScale,
  onCopy,
  mood,
  relativeSolarProgress,
  solarTemperatureRatio,
  showSolarProgress,
  formatTemperature,
}: TemperatureInputCardProps) {
  const shareText = conversions
    .map(
      (conversion) =>
        `${conversion.label}: ${formatTemperature(conversion.result)} ${conversion.symbol}`,
    )
    .join("\n");
  const resultSummary = conversions.length
    ? `轉換完成，共 ${conversions.length} 種溫標結果。`
    : (validationError ?? "等待有效的溫度輸入。");

  return (
    <section className="tool-panel" aria-labelledby="converter-title">
      <header className="tool-header">
        <div>
          <p className="section-kicker">CONVERTER</p>
          <h2 id="converter-title" className="tool-title">
            輸入與結果
          </h2>
          <p className="tool-description">
            選擇輸入溫標並填入數值，其他五種尺度會即時更新。
          </p>
        </div>
        <div className="tool-actions">
          <ShareButton
            title="溫度工作室 - 轉換結果"
            text={shareText || "使用溫度工作室進行溫度轉換"}
          />
          <button type="button" onClick={onReset} className="secondary-button">
            <RotateCcw className="h-4 w-4" aria-hidden />
            重設
          </button>
          <button
            type="button"
            onClick={onAddHistory}
            disabled={!canAddHistory}
            className="primary-button"
          >
            <Plus className="h-4 w-4" aria-hidden />
            加入紀錄
          </button>
        </div>
      </header>

      <ScaleSelector
        activeScale={scale}
        scales={scales}
        onScaleChange={onScaleChange}
      />

      <div className="input-workspace">
        <label className="value-field">
          <span className="field-label">輸入數值</span>
          <span
            className={cn(
              "value-input-shell",
              validationError && "value-input-shell--error",
            )}
          >
            <Thermometer className="h-5 w-5 shrink-0 text-accent" aria-hidden />
            <input
              type="text"
              inputMode="decimal"
              value={rawInput}
              onChange={onInputChange}
              placeholder="例如 25"
              aria-invalid={Boolean(validationError)}
              aria-describedby="temperature-input-help"
              className="value-input"
            />
            <span className="value-symbol">{activeSymbol ?? ""}</span>
          </span>
        </label>
        <p
          id="temperature-input-help"
          role={validationError ? "alert" : undefined}
          className={cn("field-help", validationError && "field-help--error")}
        >
          {validationError ?? "可直接輸入小數；物理下限為絕對零度。"}
        </p>

        <div className="range-toolbar">
          <div>
            <span className="field-label">滑桿範圍</span>
            <p className="field-help">
              {formatTemperature(sliderRange.min)} 至{" "}
              {formatTemperature(sliderRange.max)} {activeSymbol}
            </p>
          </div>
          <div
            role="radiogroup"
            aria-label="滑桿使用情境"
            className="range-mode-control"
            onKeyDown={(event) =>
              handleRadioGroupKeyDown(
                event,
                rangeOptions.map((item) => item.code),
                rangeMode,
                onRangeModeChange,
              )
            }
          >
            {rangeOptions.map((option) => (
              <button
                key={option.code}
                type="button"
                role="radio"
                aria-checked={rangeMode === option.code}
                data-radio-value={option.code}
                tabIndex={rangeMode === option.code ? 0 : -1}
                title={option.description}
                onClick={() => onRangeModeChange(option.code)}
                className={cn(
                  "range-mode-button",
                  rangeMode === option.code && "range-mode-button--active",
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
          step={sliderStep}
          value={sliderValue}
          onChange={onSliderChange}
          aria-label={`溫度滑桿，單位 ${activeSymbol ?? ""}`}
          className="temperature-range"
        />
        {sliderOutOfRange ? (
          <p className="field-help">
            目前輸入超出此滑桿情境，但轉換結果仍使用完整輸入值。
          </p>
        ) : null}
      </div>

      <div className="result-section">
        <div className="section-heading-row">
          <div>
            <p className="section-kicker">RESULTS</p>
            <h2 className="section-title">即時轉換結果</h2>
          </div>
          <span className="result-count">{conversions.length} / 6</span>
        </div>
        <div className="sr-only" role="status" aria-live="polite">
          {resultSummary}
        </div>
        {conversions.length ? (
          <ul className="result-list">
            {conversions.map((conversion) => (
              <li
                key={conversion.code}
                className={cn(
                  "result-row",
                  conversion.code === scale && "result-row--active",
                )}
              >
                <div className="result-label">
                  <span>{conversion.label}</span>
                  {conversion.code === "celsius" && mood ? (
                    <small>{mood.title}</small>
                  ) : null}
                </div>
                <strong className="result-value">
                  {formatTemperature(conversion.result)}
                  <span>{conversion.symbol}</span>
                </strong>
                <button
                  type="button"
                  onClick={() =>
                    onCopy(
                      `${formatTemperature(conversion.result)} ${conversion.symbol}`,
                      conversion.code,
                    )
                  }
                  className="icon-button"
                  aria-label={`複製${conversion.label}結果`}
                  title={`複製${conversion.label}結果`}
                >
                  {copiedScale === conversion.code ? (
                    <Check className="h-4 w-4 text-success-ink" aria-hidden />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden />
                  )}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="empty-state">輸入有效溫度後顯示六種換算結果。</div>
        )}
      </div>

      <div className="comparison-panel">
        <div className="section-heading-row">
          <div>
            <h2 className="section-title">絕對溫度比較</h2>
            <p className="field-help">以 Kelvin 比較太陽光球層約 5,778 K</p>
          </div>
          <strong>
            {showSolarProgress
              ? `${formatTemperature(solarTemperatureRatio)}%`
              : "--"}
          </strong>
        </div>
        <div
          className="comparison-track"
          role="progressbar"
          aria-label="相對於太陽表面絕對溫度"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(relativeSolarProgress)}
        >
          <span style={{ width: `${relativeSolarProgress}%` }} />
        </div>
        <p className="field-help">
          此比例只比較絕對溫度，不代表物體總能量或接觸安全性。
        </p>
      </div>
    </section>
  );
}

function ScaleSelector({
  activeScale,
  scales,
  onScaleChange,
}: {
  activeScale: TemperatureScaleCode;
  scales: TemperatureScale[];
  onScaleChange: (code: TemperatureScaleCode) => void;
}) {
  const codes = scales.map((item) => item.code);
  return (
    <div
      role="radiogroup"
      aria-label="選擇輸入溫標"
      onKeyDown={(event) =>
        handleRadioGroupKeyDown(event, codes, activeScale, onScaleChange)
      }
      className="scale-selector"
    >
      {scales.map((item) => (
        <button
          key={item.code}
          type="button"
          role="radio"
          aria-checked={activeScale === item.code}
          data-radio-value={item.code}
          tabIndex={activeScale === item.code ? 0 : -1}
          onClick={() => onScaleChange(item.code)}
          className={cn(
            "scale-button",
            activeScale === item.code && "scale-button--active",
          )}
        >
          <span>{item.symbol}</span>
          <small>{item.label.split(" (")[0]}</small>
        </button>
      ))}
    </div>
  );
}
