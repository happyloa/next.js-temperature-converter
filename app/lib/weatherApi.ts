/**
 * Open-Meteo API client：純粹的資料存取層，不含任何 React 或應用程式狀態。
 */

export type GeoApiLocation = {
  id?: number;
  name: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  country?: string;
  admin1?: string;
  admin2?: string;
  admin3?: string;
};

type GeoApiResponse = {
  results?: GeoApiLocation[];
};

export type ForecastApiResponse = {
  current: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    weather_code: number;
    surface_pressure?: number;
    pressure_msl?: number;
    precipitation: number;
    uv_index: number;
    is_day: number;
  };
  current_units?: {
    temperature_2m?: string;
    apparent_temperature?: string;
    relative_humidity_2m?: string;
    wind_speed_10m?: string;
    surface_pressure?: string;
    pressure_msl?: string;
    precipitation?: string;
    uv_index?: string;
  };
  daily?: {
    time?: string[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
  };
  daily_units?: {
    temperature_2m_max?: string;
    temperature_2m_min?: string;
  };
  timezone?: string;
  timezone_abbreviation?: string;
  utc_offset_seconds?: number;
};

export type AirQualityApiResponse = {
  current?: {
    european_aqi: number;
    pm2_5: number;
    pm10: number;
    time: string;
  };
  current_units?: {
    european_aqi?: string;
    pm2_5?: string;
    pm10?: string;
  };
};

/**
 * 依地點名稱搜尋座標，找不到地點或請求失敗時拋出錯誤。
 */
export async function searchLocation(
  query: string,
  signal?: AbortSignal,
): Promise<GeoApiLocation> {
  const results = await searchLocations(query, 1, signal);
  if (!results.length) {
    throw new Error("找不到對應的地點，請嘗試輸入更完整的名稱。");
  }

  return results[0];
}

export async function searchLocations(
  query: string,
  count = 5,
  signal?: AbortSignal,
): Promise<GeoApiLocation[]> {
  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      query,
    )}&count=${count}&language=zh&format=json`,
    { signal },
  );

  if (!response.ok) {
    throw new Error("地理定位服務暫時無法使用");
  }

  const data = (await response.json()) as GeoApiResponse;
  return data?.results ?? [];
}

/**
 * 取得指定座標的即時天氣與每日預報，請求失敗時拋出錯誤。
 */
export async function fetchForecast(
  latitude: number,
  longitude: number,
  timezone: string,
  days: 7 | 14,
  signal?: AbortSignal,
): Promise<ForecastApiResponse> {
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,surface_pressure,pressure_msl,precipitation,uv_index,is_day&daily=temperature_2m_max,temperature_2m_min&forecast_days=${days}&timezone=${encodeURIComponent(
      timezone,
    )}`,
    { signal },
  );

  if (!response.ok) {
    throw new Error("無法取得天氣資訊，請稍後再試。");
  }

  return (await response.json()) as ForecastApiResponse;
}

/**
 * 取得指定座標的空氣品質資訊。非關鍵資料，請求失敗或被中止時回傳 null
 * 而非拋出錯誤，讓主要的天氣資訊仍可正常顯示。
 */
export async function fetchAirQuality(
  latitude: number,
  longitude: number,
  signal?: AbortSignal,
): Promise<AirQualityApiResponse | null> {
  try {
    const response = await fetch(
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=european_aqi,pm2_5,pm10`,
      { signal },
    );
    if (!response.ok) return null;
    return (await response.json()) as AirQualityApiResponse;
  } catch (error) {
    if (!(error instanceof DOMException && error.name === "AbortError")) {
      console.error("fetchAirQuality", error);
    }
    return null;
  }
}
