import type { TemperaturePreset } from "../types/temperature";

/**
 * 首屏英雄橫幅，簡述產品定位並提供常用溫度快速鍵。
 */

type HeroSectionProps = {
  presets: TemperaturePreset[];
  onPresetSelect: (preset: TemperaturePreset) => void;
};

export function HeroSection({ presets, onPresetSelect }: HeroSectionProps) {
  return (
    <section className="flex w-full min-w-0 max-w-full flex-col items-center gap-6 px-4 text-center">
      <span className="theme-tag">⚡ Temperature Intelligence Platform</span>
      <h1 className="text-3xl font-bold leading-tight text-slate-50 sm:text-4xl md:text-5xl">
        溫度實驗室 · 智慧轉換平台
      </h1>
      <p className="max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base md:text-lg">
        即時轉換六種常見與歷史溫標，並結合全球天氣、空氣品質與時區日照資訊。無論是烹飪、科研或工業控溫，都能在此獲得可直接對外展示的專業體驗。
      </p>
      <ul className="grid w-full gap-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:w-auto xl:grid-cols-7 list-none m-0 p-0">
        {presets.map((preset) => (
          <li key={preset.label} className="list-none w-full">
            <button
              type="button"
              onClick={() => onPresetSelect(preset)}
              className="theme-chip w-full px-4 py-2 text-xs font-medium sm:text-sm"
            >
              <span>{preset.emoji}</span>
              {preset.label}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
