import { Check, Copy } from "lucide-react";

import { formatTemperature } from "../../lib/format";
import { ui } from "../../lib/uiStyles";
import { cn } from "../../lib/utils";
import type {
  TemperatureConversion,
  TemperatureScaleCode,
  ThermalMood,
} from "../../types/temperature";

type ConversionResultsProps = {
  scale: TemperatureScaleCode;
  conversions: TemperatureConversion[];
  copiedScale: TemperatureScaleCode | null;
  validationError: string | null;
  mood: ThermalMood;
  onCopy: (text: string, code: TemperatureScaleCode) => void | Promise<void>;
};

export function ConversionResults({
  scale,
  conversions,
  copiedScale,
  validationError,
  mood,
  onCopy,
}: ConversionResultsProps) {
  const resultSummary = conversions.length
    ? `轉換完成，共 ${conversions.length} 種溫標結果。`
    : (validationError ?? "等待有效的溫度輸入。");

  return (
    <div className="mt-5 border-t border-edge-subtle pt-5">
      <div className={ui.headingRow}>
        <div>
          <p className={ui.kicker}>RESULTS</p>
          <h2 className={ui.sectionTitle}>即時轉換結果</h2>
        </div>
        <span className={ui.count}>{conversions.length} / 6</span>
      </div>
      <div className="sr-only" role="status" aria-live="polite">
        {resultSummary}
      </div>
      {conversions.length ? (
        <ul className="mt-3 list-none">
          {conversions.map((conversion) => (
            <li
              key={conversion.code}
              className={cn(
                "grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(7rem,auto)_2.25rem] items-center gap-3 border-t border-edge-subtle py-3 first:border-t-0 max-[430px]:grid-cols-[minmax(0,1fr)_minmax(5.5rem,auto)_2.25rem] max-[430px]:gap-2",
                conversion.code === scale && "bg-surface-soft",
              )}
            >
              <div className="flex min-w-0 flex-col text-[0.8125rem] text-ink-medium">
                <span>{conversion.label}</span>
                {conversion.code === "celsius" ? (
                  <small className="text-[0.6875rem] text-ink-subtle">
                    {mood.title}
                  </small>
                ) : null}
              </div>
              <strong className="text-right text-lg text-ink-strong [font-variant-numeric:tabular-nums] [overflow-wrap:anywhere] max-[430px]:text-[0.9375rem]">
                {formatTemperature(conversion.result)}
                <span className="ml-1 text-xs text-ink-subtle">
                  {conversion.symbol}
                </span>
              </strong>
              <button
                type="button"
                onClick={() =>
                  onCopy(
                    `${formatTemperature(conversion.result)} ${conversion.symbol}`,
                    conversion.code,
                  )
                }
                className={ui.iconButton}
                aria-label={`複製${conversion.label}結果`}
                title={`複製${conversion.label}結果`}
              >
                {copiedScale === conversion.code ? (
                  <Check className="h-4 w-4 text-accent" aria-hidden />
                ) : (
                  <Copy className="h-4 w-4" aria-hidden />
                )}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className={ui.emptyState}>輸入有效溫度後顯示六種換算結果。</div>
      )}
    </div>
  );
}
