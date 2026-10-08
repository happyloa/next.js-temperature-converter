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
      className="mt-5 grid grid-cols-3 gap-px border border-edge-subtle bg-edge-subtle sm:grid-cols-6"
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
            "flex min-h-17 min-w-0 flex-col items-start justify-center gap-1 border-b-2 px-3 transition-[border-color] hover:bg-surface-soft",
            activeScale === item.code
              ? "border-accent-label bg-surface-medium text-ink-strong"
              : "border-transparent bg-surface-strong text-ink-medium",
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
