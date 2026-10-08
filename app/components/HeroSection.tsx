import { ArrowUpRight } from "lucide-react";
import type { TemperaturePreset } from "../types/temperature";
import { TEMPERATURE_SCALES } from "../lib/temperature";
import { ui } from "../lib/uiStyles";

type HeroSectionProps = {
  presets: TemperaturePreset[];
  onPresetSelect: (preset: TemperaturePreset) => void;
};

export function HeroSection({ presets, onPresetSelect }: HeroSectionProps) {
  return (
    <section
      className="mb-8 border-b border-edge-subtle"
      aria-labelledby="page-title"
    >
      <div className="grid min-w-0 gap-6 pb-8 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div className="border-l-4 border-accent-label pl-5 sm:pl-7">
          <h1 id="page-title" className={ui.pageTitle}>
            溫度轉換器
          </h1>
          <p className={ui.description}>
            輸入一個溫度，即時換算六種溫標。從日常、烹飪到科學情境，都能找到對應的尺度。
          </p>
        </div>
        <div className="hidden border-l border-edge-subtle pl-10 sm:block">
          <strong className="block text-7xl font-normal leading-none tracking-[-0.06em]">
            {TEMPERATURE_SCALES.length.toString().padStart(2, "0")}
          </strong>
          <p className="mt-3 text-xs text-ink-subtle">種溫標 · 即時換算</p>
        </div>
      </div>
      <div className="flex min-w-0 flex-col gap-3 border-t border-edge-subtle py-4 lg:flex-row lg:items-center lg:gap-8">
        <p className="shrink-0 text-xs font-bold text-ink-medium">常用情境</p>
        <div
          className="flex min-w-0 flex-wrap gap-2"
          role="group"
          aria-label="常用溫度情境"
        >
          {presets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => onPresetSelect(preset)}
              className="inline-flex min-h-10 items-center justify-between gap-3 border border-edge-subtle bg-surface-strong px-3 text-xs text-ink-medium transition-[border-color] hover:border-accent-label hover:text-accent-label"
            >
              {preset.label}
              <ArrowUpRight className="size-3.5" aria-hidden />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
