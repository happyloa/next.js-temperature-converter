import type { TemperaturePreset } from "../types/temperature";
import { ui } from "../lib/uiStyles";

type HeroSectionProps = {
  presets: TemperaturePreset[];
  onPresetSelect: (preset: TemperaturePreset) => void;
};

export function HeroSection({ presets, onPresetSelect }: HeroSectionProps) {
  return (
    <section
      className="mb-6 overflow-hidden rounded-2xl border border-edge-subtle bg-surface-strong p-5 shadow-[var(--shadow)] sm:p-6"
      aria-labelledby="page-title"
    >
      <div className="flex min-w-0 flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className={ui.kicker}>TEMPERATURE STUDIO</p>
          <h1 id="page-title" className={ui.pageTitle}>
            溫度轉換器
          </h1>
          <p className={ui.description}>
            六種溫標即時換算，搭配常用情境、物理邊界與本機歷史紀錄。
          </p>
        </div>
        <p className="max-w-56 text-sm leading-relaxed text-ink-subtle md:text-right">
          從一個數值開始，快速理解不同溫標的意義。
        </p>
      </div>

      <div className="mt-5 border-t border-edge-subtle pt-4">
        <p className="text-xs font-bold text-ink-medium">快速帶入情境</p>
        <div
          className="mt-2.5 flex min-w-0 gap-2 overflow-x-auto px-0.5 pb-1 [scrollbar-width:thin]"
          role="group"
          aria-label="常用溫度情境"
        >
          {presets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => onPresetSelect(preset)}
              className="inline-flex min-h-9 shrink-0 items-center justify-center gap-1.5 rounded-full border border-edge-subtle bg-surface-medium px-3 py-2 text-xs font-bold text-ink-medium transition-colors hover:border-accent hover:bg-surface-soft hover:text-ink-strong"
            >
              <span aria-hidden>{preset.emoji}</span>
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
