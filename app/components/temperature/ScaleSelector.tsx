import { TEMPERATURE_SCALES } from "../../lib/temperature";
import { cn, handleRadioGroupKeyDown } from "../../lib/utils";
import type { TemperatureScaleCode } from "../../types/temperature";

export function ScaleSelector({
  activeScale,
  onScaleChange,
}: {
  activeScale: TemperatureScaleCode;
  onScaleChange: (code: TemperatureScaleCode) => void;
}) {
  const codes = TEMPERATURE_SCALES.map((item) => item.code);

  return (
    <div
      role="radiogroup"
      aria-label="選擇輸入溫標"
      onKeyDown={(event) =>
        handleRadioGroupKeyDown(event, codes, activeScale, onScaleChange)
      }
      className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-6"
    >
      {TEMPERATURE_SCALES.map((item) => (
        <button
          key={item.code}
          type="button"
          role="radio"
          aria-checked={activeScale === item.code}
          data-radio-value={item.code}
          tabIndex={activeScale === item.code ? 0 : -1}
          onClick={() => onScaleChange(item.code)}
          className={cn(
            "flex min-h-13 min-w-0 flex-col items-center justify-center gap-0.5 rounded-lg border bg-surface-medium transition-colors hover:border-accent",
            activeScale === item.code
              ? "border-accent bg-surface-soft text-ink-strong"
              : "border-edge-subtle text-ink-medium",
          )}
        >
          <span className="text-[0.9375rem] font-[750] text-ink-strong">
            {item.symbol}
          </span>
          <small className="max-w-full overflow-hidden text-[0.6875rem] text-ellipsis whitespace-nowrap">
            {item.label.split(" (")[0]}
          </small>
        </button>
      ))}
    </div>
  );
}
