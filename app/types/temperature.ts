/**
 * 溫度相關型別定義，集中管理全站共用的尺度資訊。
 * 使用繁體中文註解方便未來維護與分享專案時閱讀。
 */
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

export type ThermalMood = {
  /**
   * 依照攝氏值判斷出的狀態標題，例如舒適區間、極地酷寒等。
   */
  title: string;
  /**
   * 補充描述，協助使用者理解環境或安全提醒。
   */
  description: string;
  /**
   * 代表情境的 emoji，搭配文字增加親和力。
   */
  emoji: string;
};

export type TemperaturePreset = {
  label: string;
  value: number;
  scale: TemperatureScaleCode;
  emoji: string;
};

export type TemperatureRangeOption = {
  code: TemperatureRangeMode;
  label: string;
  description: string;
  minKelvin: number;
  maxKelvin: number;
  stepCount: number;
};
