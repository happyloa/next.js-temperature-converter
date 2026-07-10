import type { TemperaturePreset } from "../types/temperature";

type HeroSectionProps = {
  presets: TemperaturePreset[];
  onPresetSelect: (preset: TemperaturePreset) => void;
};

export function HeroSection({ presets, onPresetSelect }: HeroSectionProps) {
  return (
    <section className="converter-intro" aria-labelledby="page-title">
      <div>
        <p className="section-kicker">TEMPERATURE STUDIO</p>
        <h1 id="page-title" className="page-title">
          溫度轉換器
        </h1>
        <p className="page-description">
          六種溫標即時換算，搭配常用情境、物理邊界與本機歷史紀錄。
        </p>
      </div>
      <div className="preset-strip" aria-label="常用溫度情境">
        {presets.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => onPresetSelect(preset)}
            className="preset-button"
          >
            <span aria-hidden>{preset.emoji}</span>
            {preset.label}
          </button>
        ))}
      </div>
    </section>
  );
}
