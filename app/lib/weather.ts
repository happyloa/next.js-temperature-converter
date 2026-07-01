/**
 * Open-Meteo weather code 對應的中文描述。
 */
const WEATHER_CODE_MAP: Record<number, string> = {
  0: "晴朗無雲",
  1: "大致晴朗",
  2: "局部多雲",
  3: "陰天",
  45: "有霧",
  48: "霧凇",
  51: "毛毛雨",
  53: "間歇性小雨",
  55: "毛毛雨偏強",
  56: "凍毛毛雨",
  57: "凍毛毛雨偏強",
  61: "小雨",
  63: "中雨",
  65: "大雨",
  66: "凍雨",
  67: "凍雨偏強",
  71: "小雪",
  73: "中雪",
  75: "大雪",
  77: "霰或冰珠",
  80: "短暫小陣雨",
  81: "短暫中陣雨",
  82: "短暫強陣雨",
  85: "短暫小陣雪",
  86: "短暫強陣雪",
  95: "可能打雷",
  96: "雷陣雨伴隨冰雹",
  99: "強雷陣雨伴隨冰雹",
};

/**
 * 預設城市清單，方便快速體驗。
 */
export type WeatherPreset = {
  label: string;
  query: string;
};

/**
 * 預設城市清單，方便快速體驗。
 * 使用英文搜尋以確保 Open-Meteo API 的準確性。
 */
export const WEATHER_PRESETS: WeatherPreset[] = [
  { label: "台北", query: "Taipei" },
  { label: "台中", query: "Taichung" },
  { label: "高雄", query: "Kaohsiung" },
  { label: "台南", query: "Tainan" },
  { label: "東京", query: "Tokyo" },
  { label: "大阪", query: "Osaka" },
  { label: "首爾", query: "Seoul" },
  { label: "新加坡", query: "Singapore" },
  { label: "曼谷", query: "Bangkok" },
  { label: "紐約", query: "New York" },
  { label: "倫敦", query: "London" },
  { label: "巴黎", query: "Paris" },
  { label: "柏林", query: "Berlin" },
  { label: "雪梨", query: "Sydney" },
  { label: "羅馬", query: "Rome" },
  { label: "杜拜", query: "Dubai" },
  { label: "多倫多", query: "Toronto" },
  { label: "溫哥華", query: "Vancouver" },
];

export const getWeatherDescription = (code: number): string =>
  WEATHER_CODE_MAP[code] ?? "天氣狀況不明，請再試一次。";
