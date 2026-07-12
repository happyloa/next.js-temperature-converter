/**
 * Open-Meteo API client. This module owns transport concerns and validates
 * external payloads before they reach React state.
 */

import { isAbortError } from "./async";

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
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
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
  current: {
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

const API_TIMEOUT_MS = 10_000;
const GEOCODING_ENDPOINT = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_ENDPOINT = "https://api.open-meteo.com/v1/forecast";
const AIR_QUALITY_ENDPOINT =
  "https://air-quality-api.open-meteo.com/v1/air-quality";

class WeatherApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WeatherApiError";
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const isOptionalString = (value: unknown): value is string | undefined =>
  value === undefined || typeof value === "string";

const isOptionalNumber = (value: unknown): value is number | undefined =>
  value === undefined || isFiniteNumber(value);

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

const isNumberArray = (value: unknown): value is number[] =>
  Array.isArray(value) && value.every(isFiniteNumber);

const hasOptionalStringFields = (value: unknown, fields: string[]): boolean =>
  value === undefined ||
  (isRecord(value) && fields.every((field) => isOptionalString(value[field])));

const isGeoApiLocation = (value: unknown): value is GeoApiLocation => {
  if (!isRecord(value)) return false;
  return (
    typeof value.name === "string" &&
    isFiniteNumber(value.latitude) &&
    isFiniteNumber(value.longitude) &&
    isOptionalNumber(value.id) &&
    isOptionalString(value.timezone) &&
    isOptionalString(value.country) &&
    isOptionalString(value.admin1) &&
    isOptionalString(value.admin2) &&
    isOptionalString(value.admin3)
  );
};

const isForecastApiResponse = (
  value: unknown,
): value is ForecastApiResponse => {
  if (!isRecord(value) || !isRecord(value.current) || !isRecord(value.daily)) {
    return false;
  }

  const { current, daily } = value;
  const times = daily.time;
  const highs = daily.temperature_2m_max;
  const lows = daily.temperature_2m_min;
  const validDaily =
    isStringArray(times) &&
    isNumberArray(highs) &&
    isNumberArray(lows) &&
    times.length > 0 &&
    times.length === highs.length &&
    times.length === lows.length;

  return (
    typeof current.time === "string" &&
    isFiniteNumber(current.temperature_2m) &&
    isFiniteNumber(current.apparent_temperature) &&
    isFiniteNumber(current.relative_humidity_2m) &&
    isFiniteNumber(current.wind_speed_10m) &&
    isFiniteNumber(current.weather_code) &&
    isOptionalNumber(current.surface_pressure) &&
    isOptionalNumber(current.pressure_msl) &&
    isFiniteNumber(current.precipitation) &&
    isFiniteNumber(current.uv_index) &&
    isFiniteNumber(current.is_day) &&
    validDaily &&
    hasOptionalStringFields(value.current_units, [
      "temperature_2m",
      "apparent_temperature",
      "relative_humidity_2m",
      "wind_speed_10m",
      "surface_pressure",
      "pressure_msl",
      "precipitation",
      "uv_index",
    ]) &&
    hasOptionalStringFields(value.daily_units, [
      "temperature_2m_max",
      "temperature_2m_min",
    ]) &&
    isOptionalString(value.timezone) &&
    isOptionalString(value.timezone_abbreviation) &&
    isOptionalNumber(value.utc_offset_seconds)
  );
};

const isAirQualityApiResponse = (
  value: unknown,
): value is AirQualityApiResponse => {
  if (!isRecord(value) || !isRecord(value.current)) return false;
  return (
    isFiniteNumber(value.current.european_aqi) &&
    isFiniteNumber(value.current.pm2_5) &&
    isFiniteNumber(value.current.pm10) &&
    typeof value.current.time === "string" &&
    hasOptionalStringFields(value.current_units, [
      "european_aqi",
      "pm2_5",
      "pm10",
    ])
  );
};

async function requestJson(
  url: URL,
  fallbackMessage: string,
  signal?: AbortSignal,
): Promise<unknown> {
  const controller = new AbortController();
  let timedOut = false;
  const abortFromCaller = () => controller.abort(signal?.reason);

  if (signal?.aborted) abortFromCaller();
  else signal?.addEventListener("abort", abortFromCaller, { once: true });

  const timeout = globalThis.setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, API_TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new WeatherApiError(fallbackMessage);

    try {
      return await response.json();
    } catch {
      throw new WeatherApiError(fallbackMessage);
    }
  } catch (error) {
    if (signal?.aborted) throw error;
    if (timedOut) {
      throw new WeatherApiError("服務回應逾時，請稍後再試。");
    }
    if (isAbortError(error)) throw error;
    if (error instanceof WeatherApiError) throw error;
    throw new WeatherApiError(fallbackMessage);
  } finally {
    globalThis.clearTimeout(timeout);
    signal?.removeEventListener("abort", abortFromCaller);
  }
}

/** 搜尋第一個符合的地點。 */
export async function searchLocation(
  query: string,
  signal?: AbortSignal,
): Promise<GeoApiLocation> {
  const results = await searchLocations(query, 1, signal);
  if (!results.length) {
    throw new WeatherApiError("找不到對應的地點，請嘗試輸入更完整的名稱。");
  }
  return results[0];
}

export async function searchLocations(
  query: string,
  count = 5,
  signal?: AbortSignal,
): Promise<GeoApiLocation[]> {
  const normalizedQuery = query.trim().slice(0, 100);
  if (!normalizedQuery) return [];

  const url = new URL(GEOCODING_ENDPOINT);
  url.search = new URLSearchParams({
    name: normalizedQuery,
    count: `${Math.min(Math.max(Math.trunc(count), 1), 10)}`,
    language: "zh",
    format: "json",
  }).toString();

  const data = await requestJson(
    url,
    "地理定位服務暫時無法使用，請稍後再試。",
    signal,
  );
  if (!isRecord(data) || data.results === undefined) return [];
  if (!Array.isArray(data.results) || !data.results.every(isGeoApiLocation)) {
    throw new WeatherApiError("地理定位服務回傳了無效資料，請稍後再試。");
  }
  return data.results;
}

/** 取得目前天氣與指定天數的每日預報。 */
export async function fetchForecast(
  latitude: number,
  longitude: number,
  timezone: string,
  days: 7 | 14,
  signal?: AbortSignal,
): Promise<ForecastApiResponse> {
  const url = new URL(FORECAST_ENDPOINT);
  url.search = new URLSearchParams({
    latitude: `${latitude}`,
    longitude: `${longitude}`,
    current:
      "temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,surface_pressure,pressure_msl,precipitation,uv_index,is_day",
    daily: "temperature_2m_max,temperature_2m_min",
    forecast_days: `${days}`,
    timezone,
  }).toString();

  const data = await requestJson(url, "無法取得天氣資訊，請稍後再試。", signal);
  if (!isForecastApiResponse(data)) {
    throw new WeatherApiError("天氣服務回傳了無效資料，請稍後再試。");
  }
  return data;
}

/** 空氣品質是補充資訊；非取消類錯誤會降級為 null。 */
export async function fetchAirQuality(
  latitude: number,
  longitude: number,
  signal?: AbortSignal,
): Promise<AirQualityApiResponse | null> {
  const url = new URL(AIR_QUALITY_ENDPOINT);
  url.search = new URLSearchParams({
    latitude: `${latitude}`,
    longitude: `${longitude}`,
    current: "european_aqi,pm2_5,pm10",
  }).toString();

  try {
    const data = await requestJson(url, "空氣品質服務暫時無法使用。", signal);
    if (!isAirQualityApiResponse(data)) {
      throw new WeatherApiError("空氣品質服務回傳了無效資料。");
    }
    return data;
  } catch (error) {
    if (signal?.aborted) throw error;
    if (isAbortError(error)) return null;
    console.error("fetchAirQuality", error);
    return null;
  }
}
