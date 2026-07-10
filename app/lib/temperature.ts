import type {
  TemperatureConversion,
  TemperaturePreset,
  TemperatureRangeMode,
  TemperatureRangeOption,
  TemperatureScale,
  TemperatureScaleCode,
  ThermalMood,
} from "../types/temperature";

/**
 * 物理常數：絕對零度（單位：K）。
 */
export const ABSOLUTE_ZERO_K = 0;

/**
 * 物理常數：太陽表面溫度（單位：K），作為滑桿與視覺化的上限參考。
 */
export const SOLAR_SURFACE_K = 5778;

export const TEMPERATURE_RANGE_OPTIONS: TemperatureRangeOption[] = [
  {
    code: "daily",
    label: "日常",
    description: "居家、戶外與冷藏環境",
    minKelvin: 223.15,
    maxKelvin: 333.15,
    stepCount: 440,
  },
  {
    code: "cooking",
    label: "烹飪",
    description: "冷凍、沖泡與烤箱溫度",
    minKelvin: 223.15,
    maxKelvin: 573.15,
    stepCount: 700,
  },
  {
    code: "science",
    label: "科學",
    description: "絕對零度至太陽表面",
    minKelvin: ABSOLUTE_ZERO_K,
    maxKelvin: SOLAR_SURFACE_K,
    stepCount: 1000,
  },
];

/**
 * 溫標代碼清單，方便驗證外部輸入。
 */
export const TEMPERATURE_SCALE_CODES: TemperatureScaleCode[] = [
  "celsius",
  "fahrenheit",
  "kelvin",
  "rankine",
  "reaumur",
  "newton",
];

/**
 * 溫標與轉換公式設定，統一集中管理避免重複邏輯。
 */
export const TEMPERATURE_SCALES: TemperatureScale[] = [
  {
    code: "celsius",
    label: "攝氏 (°C)",
    symbol: "°C",
    toKelvin: (value) => value + 273.15,
    fromKelvin: (value) => value - 273.15,
  },
  {
    code: "fahrenheit",
    label: "華氏 (°F)",
    symbol: "°F",
    toKelvin: (value) => ((value + 459.67) * 5) / 9,
    fromKelvin: (value) => (value * 9) / 5 - 459.67,
  },
  {
    code: "kelvin",
    label: "絕對溫標 (K)",
    symbol: "K",
    toKelvin: (value) => value,
    fromKelvin: (value) => value,
  },
  {
    code: "rankine",
    label: "蘭氏 (°R)",
    symbol: "°R",
    toKelvin: (value) => (value * 5) / 9,
    fromKelvin: (value) => (value * 9) / 5,
  },
  {
    code: "reaumur",
    label: "列氏 (°Ré)",
    symbol: "°Ré",
    toKelvin: (value) => value * 1.25 + 273.15,
    fromKelvin: (value) => (value - 273.15) * 0.8,
  },
  {
    code: "newton",
    label: "牛頓氏 (°N)",
    symbol: "°N",
    toKelvin: (value) => value * (100 / 33) + 273.15,
    fromKelvin: (value) => (value - 273.15) * (33 / 100),
  },
];

/**
 * 首頁英雄區塊使用的預設溫度清單。
 */
export const TEMPERATURE_PRESETS: TemperaturePreset[] = [
  { label: "絕對零度", value: 0, scale: "kelvin", emoji: "🧊" },
  { label: "冰點", value: 0, scale: "celsius", emoji: "❄️" },
  { label: "體溫", value: 98.6, scale: "fahrenheit", emoji: "🫀" },
  { label: "咖啡沖泡", value: 92, scale: "celsius", emoji: "☕️" },
  { label: "烤箱模式", value: 392, scale: "fahrenheit", emoji: "🍞" },
  { label: "熔岩", value: 1300, scale: "celsius", emoji: "🌋" },
  { label: "太陽表面", value: 5778, scale: "kelvin", emoji: "☀️" },
];

/**
 * 允許輸入欄位使用的十進位格式，限制字元以避免 NaN。
 */
export const decimalPattern = /^-?\d*(\.\d*)?$/;

/**
 * 取得指定代碼的溫標設定。
 */
export const getScale = (
  code: TemperatureScaleCode,
): TemperatureScale | undefined =>
  TEMPERATURE_SCALES.find((item) => item.code === code);

export const getTemperatureRange = (
  scale: TemperatureScale,
  mode: TemperatureRangeMode,
) => {
  const option =
    TEMPERATURE_RANGE_OPTIONS.find((item) => item.code === mode) ??
    TEMPERATURE_RANGE_OPTIONS[0];
  const normalize = (value: number) => Number(value.toFixed(8));
  const min = normalize(scale.fromKelvin(option.minKelvin));
  const max = normalize(scale.fromKelvin(option.maxKelvin));

  return {
    min,
    max,
    step: normalize((max - min) / option.stepCount) || 1,
  };
};

export const getMinimumTemperature = (scale: TemperatureScale): number =>
  scale.fromKelvin(ABSOLUTE_ZERO_K);

/**
 * 依照攝氏值回傳對應的熱感情境文字。
 */
export const getThermalMood = (celsiusValue: number): ThermalMood => {
  if (!Number.isFinite(celsiusValue)) {
    return {
      title: "等待輸入",
      description: "輸入溫度後即可取得對應的情境說明與建議。",
      emoji: "🌡️",
    };
  }

  if (celsiusValue <= -50) {
    return {
      title: "極地酷寒",
      description: "此溫度代表極端寒冷環境，需使用多層防寒裝備並注意結霜。",
      emoji: "🥶",
    };
  }

  if (celsiusValue < 0) {
    return {
      title: "冰點以下",
      description: "低於純水在標準氣壓下的冰點，戶外環境可能出現結霜或結冰。",
      emoji: "❄️",
    };
  }

  if (celsiusValue < 10) {
    return {
      title: "偏冷環境",
      description: "屬於明顯偏冷的日常環境，長時間停留時應留意保暖。",
      emoji: "🧥",
    };
  }

  if (celsiusValue <= 26) {
    return {
      title: "舒適區間",
      description:
        "接近常見室內活動溫度，實際體感仍會受濕度、風速與個人狀況影響。",
      emoji: "🙂",
    };
  }

  if (celsiusValue < 35) {
    return {
      title: "偏暖環境",
      description: "環境已偏暖，體感會隨濕度、日照與通風條件明顯變化。",
      emoji: "🌤️",
    };
  }

  if (celsiusValue < 60) {
    return {
      title: "高溫區間",
      description: "已高於一般環境溫度，不宜僅依數值推斷接觸或暴露安全性。",
      emoji: "🌡️",
    };
  }

  if (celsiusValue < 100) {
    return {
      title: "沸點逼近",
      description: "接近純水在標準氣壓下的沸點；實際沸點會隨氣壓與溶質改變。",
      emoji: "♨️",
    };
  }

  if (celsiusValue < 500) {
    return {
      title: "高熱作業",
      description:
        "屬於烹飪或工業常見的高溫範圍，安全條件需依材料與設備規格判斷。",
      emoji: "🔥",
    };
  }

  return {
    title: "極端高能",
    description: "已達極端高溫範圍，這裡的換算結果僅供單位與尺度比較。",
    emoji: "🌋",
  };
};

/**
 * 透過 Kelvin 做中間值，將任意溫標轉換為完整清單。
 */
export const createConversions = (
  scale: TemperatureScale,
  value: number,
): TemperatureConversion[] => {
  if (!Number.isFinite(value)) return [];
  const kelvin = scale.toKelvin(value);
  return TEMPERATURE_SCALES.map((targetScale) => ({
    ...targetScale,
    result:
      targetScale.code === scale.code ? value : targetScale.fromKelvin(kelvin),
  }));
};
