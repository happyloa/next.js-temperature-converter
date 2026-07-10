import type { TemperaturePreset } from "../types/temperature";
import { ui } from "../lib/uiStyles";

type HeroSectionProps = {
  presets: TemperaturePreset[];
  onPresetSelect: (preset: TemperaturePreset) => void;
};

export function HeroSection({ presets, onPresetSelect }: HeroSectionProps) {
  return (
    <section
      className="mb-6 flex min-w-0 flex-col items-stretch justify-between gap-6 md:flex-row md:items-end"
      aria-labelledby="page-title"
    >
      <div>
        <p className={ui.kicker}>TEMPERATURE STUDIO</p>
        <h1 id="page-title" className={ui.pageTitle}>
          溫度轉換器
        </h1>
        <p className={ui.description}>
          六種溫標即時換算，搭配常用情境、物理邊界與本機歷史紀錄。
        </p>
      </div>
      <div
        className="flex min-w-0 gap-2 overflow-x-auto px-0.5 pt-0.5 pb-1 [scrollbar-width:thin]"
        aria-label="常用溫度情境"
      >
        {presets.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => onPresetSelect(preset)}
            className="inline-flex min-h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-edge-subtle bg-surface-strong px-3 py-2 text-xs font-semibold text-ink-medium transition-colors hover:border-accent hover:text-ink-strong"
          >
            <span aria-hidden>{preset.emoji}</span>
            {preset.label}
          </button>
        ))}
      </div>
    </section>
  );
}
