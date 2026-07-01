import type {
  TemperatureConversion,
  TemperaturePreset,
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

  if (celsiusValue <= -10) {
    return {
      title: "冰封邊緣",
      description: "容易結冰與金屬脆化，戶外作業請備妥保暖設備與防凍液。",
      emoji: "❄️",
    };
  }

  if (celsiusValue < 30) {
    return {
      title: "舒適區間",
      description: "介於常見生活與實驗室環境，適合一般測試或培養操作。",
      emoji: "🙂",
    };
  }

  if (celsiusValue < 60) {
    return {
      title: "溫熱注意",
      description: "人體長時間暴露會感到不適，建議做好散熱與水分補充。",
      emoji: "🌤️",
    };
  }

  if (celsiusValue < 100) {
    return {
      title: "沸點逼近",
      description: "接近水沸點，請注意蒸汽與壓力變化，避免密閉容器。",
      emoji: "♨️",
    };
  }

  if (celsiusValue < 500) {
    return {
      title: "高熱作業",
      description: "屬於工業或烹飪高溫範圍，需使用隔熱手套與耐熱材質。",
      emoji: "🔥",
    };
  }

  return {
    title: "極端高能",
    description: "溫度已達熔爐、熔岩或天文觀測等等級，請使用專業防護。",
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
    result: targetScale.fromKelvin(kelvin),
  }));
};
