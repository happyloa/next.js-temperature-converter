/** 溫度相關的共用型別。 */
export type TemperatureScaleCode =
  "celsius" | "fahrenheit" | "kelvin" | "rankine" | "reaumur" | "newton";

export type TemperatureRangeMode = "daily" | "cooking" | "science";

export type TemperatureScale = {
  code: TemperatureScaleCode;
  label: string;
  symbol: string;
  toKelvin: (value: number) => number;
  fromKelvin: (value: number) => number;
};

export type TemperatureConversion = TemperatureScale & { result: number };

/** 熱感情境與洞察卡片共用的文字內容。 */
export type ThermalInsight = {
  title: string;
  description: string;
};

/** 依攝氏值判斷的熱感情境，例如舒適區間、極地酷寒。 */
export type ThermalMood = ThermalInsight;

export type TemperaturePreset = {
  label: string;
  value: number;
  scale: TemperatureScaleCode;
};

export type TemperatureRangeOption = {
  code: TemperatureRangeMode;
  label: string;
  description: string;
  minKelvin: number;
  maxKelvin: number;
  stepCount: number;
};
