import type { WeatherData } from "../types/weather";
import type {
  AirQualityApiResponse,
  ForecastApiResponse,
  GeoApiLocation,
} from "./weatherApi";

/**
 * 將地理、天氣與空氣品質 API 的原始回應整理成畫面使用的 WeatherData。
 */
export function buildWeatherData(
  location: GeoApiLocation,
  forecast: ForecastApiResponse,
  airQuality: AirQualityApiResponse | null,
): WeatherData {
  const resolvedTimezone = location.timezone ?? forecast.timezone ?? "UTC";

  const offsetSeconds = forecast.utc_offset_seconds ?? 0;
  const offsetSign = offsetSeconds >= 0 ? "+" : "-";
  const offsetAbs = Math.abs(offsetSeconds);
  const offsetHours = Math.floor(offsetAbs / 3600);
  const offsetMinutes = Math.floor((offsetAbs % 3600) / 60);
  const utcOffsetString = `${offsetSign}${String(offsetHours).padStart(2, "0")}:${String(offsetMinutes).padStart(2, "0")}`;

  const now = new Date();
  const infoDate = new Date(
    now.toLocaleString("en-US", { timeZone: resolvedTimezone }),
  );
  const dayOfWeekIndex = infoDate.getDay();

  const airQualityCurrent = airQuality?.current ?? null;
  const airQualityUnits = airQuality?.current_units;

  return {
    location: `${location.name}${location.country ? ` · ${location.country}` : ""}`,
    administrative: [location.admin1, location.admin2, location.admin3].filter(
      (item): item is string => Boolean(item),
    ),
    coordinates: {
      latitude: location.latitude,
      longitude: location.longitude,
    },
    timezone: resolvedTimezone,
    timezoneAbbreviation: forecast.timezone_abbreviation ?? resolvedTimezone,
    observationTime: forecast.current.time,
    temperature: forecast.current.temperature_2m,
    temperatureUnit: forecast.current_units?.temperature_2m ?? "°C",
    apparentTemperature: forecast.current.apparent_temperature,
    apparentTemperatureUnit:
      forecast.current_units?.apparent_temperature ?? "°C",
    humidity: forecast.current.relative_humidity_2m,
    humidityUnit: forecast.current_units?.relative_humidity_2m ?? "%",
    windSpeed: forecast.current.wind_speed_10m,
    windSpeedUnit: forecast.current_units?.wind_speed_10m ?? "m/s",
    pressure:
      forecast.current.surface_pressure ??
      forecast.current.pressure_msl ??
      Number.NaN,
    pressureUnit:
      forecast.current_units?.surface_pressure ??
      forecast.current_units?.pressure_msl ??
      "hPa",
    precipitation: forecast.current.precipitation,
    precipitationUnit: forecast.current_units?.precipitation ?? "mm",
    uvIndex: forecast.current.uv_index,
    uvIndexUnit: forecast.current_units?.uv_index ?? "",
    weatherCode: forecast.current.weather_code,
    isDay: forecast.current.is_day === 1,
    dailyHigh: forecast.daily.temperature_2m_max[0],
    dailyLow: forecast.daily.temperature_2m_min[0],
    dailyTemperatureUnit: forecast.daily_units?.temperature_2m_max ?? "°C",
    airQuality: airQualityCurrent
      ? {
          aqi: airQualityCurrent.european_aqi,
          aqiUnit: airQualityUnits?.european_aqi ?? "",
          pm25: airQualityCurrent.pm2_5,
          pm25Unit: airQualityUnits?.pm2_5 ?? "µg/m³",
          pm10: airQualityCurrent.pm10,
          pm10Unit: airQualityUnits?.pm10 ?? "µg/m³",
          time: airQualityCurrent.time,
        }
      : null,
    localTime: now.toISOString(),
    utcOffset: utcOffsetString,
    dayOfWeek: dayOfWeekIndex,
    dailyForecast: forecast.daily.time.map((date, index) => ({
      date,
      high: forecast.daily.temperature_2m_max[index],
      low: forecast.daily.temperature_2m_min[index],
    })),
  };
}

export function mergeWeatherForecast(
  current: WeatherData,
  forecast: ForecastApiResponse,
): WeatherData {
  return {
    ...current,
    timezone: forecast.timezone ?? current.timezone,
    timezoneAbbreviation:
      forecast.timezone_abbreviation ?? current.timezoneAbbreviation,
    utcOffset:
      typeof forecast.utc_offset_seconds === "number"
        ? formatOffset(forecast.utc_offset_seconds)
        : current.utcOffset,
    dailyHigh: forecast.daily.temperature_2m_max[0],
    dailyLow: forecast.daily.temperature_2m_min[0],
    dailyTemperatureUnit:
      forecast.daily_units?.temperature_2m_max ?? current.dailyTemperatureUnit,
    dailyForecast: forecast.daily.time.map((date, index) => ({
      date,
      high: forecast.daily.temperature_2m_max[index],
      low: forecast.daily.temperature_2m_min[index],
    })),
  };
}

function formatOffset(offsetSeconds: number): string {
  const offsetSign = offsetSeconds >= 0 ? "+" : "-";
  const offsetAbs = Math.abs(offsetSeconds);
  const offsetHours = Math.floor(offsetAbs / 3600);
  const offsetMinutes = Math.floor((offsetAbs % 3600) / 60);
  return `${offsetSign}${String(offsetHours).padStart(2, "0")}:${String(offsetMinutes).padStart(2, "0")}`;
}

/**
 * 驗證並解析 localStorage/sessionStorage 中儲存的天氣資料，格式不符時回傳 null。
 */
export function parseWeatherPayload(
  value: unknown,
): { query: string; data: WeatherData; forecastDays: 7 | 14 } | null {
  if (!value || typeof value !== "object") return null;

  const record = value as {
    query?: unknown;
    data?: unknown;
    forecastDays?: unknown;
  };
  if (
    typeof record.query !== "string" ||
    !record.data ||
    typeof record.data !== "object"
  ) {
    return null;
  }

  const data = record.data as Partial<WeatherData>;
  const optionalNumberFields: Array<keyof WeatherData> = [
    "pressure",
    "dailyHigh",
    "dailyLow",
  ];
  const hasValidOptionalNumbers = optionalNumberFields.every(
    (field) =>
      (typeof data[field] === "number" &&
        Number.isFinite(data[field] as number)) ||
      data[field] === null,
  );
  const hasValidCoordinates =
    data.coordinates === null ||
    (data.coordinates !== undefined &&
      typeof data.coordinates === "object" &&
      typeof data.coordinates.latitude === "number" &&
      Number.isFinite(data.coordinates.latitude) &&
      typeof data.coordinates.longitude === "number" &&
      Number.isFinite(data.coordinates.longitude));
  const hasValidAdministrative =
    Array.isArray(data.administrative) &&
    data.administrative.every((item) => typeof item === "string");
  const hasValidDailyForecast =
    Array.isArray(data.dailyForecast) &&
    data.dailyForecast.every(
      (item) =>
        item &&
        typeof item === "object" &&
        typeof item.date === "string" &&
        !Number.isNaN(Date.parse(`${item.date}T00:00:00`)) &&
        typeof item.high === "number" &&
        Number.isFinite(item.high) &&
        typeof item.low === "number" &&
        Number.isFinite(item.low),
    );
  const forecastLength = Array.isArray(data.dailyForecast)
    ? data.dailyForecast.length
    : 0;
  const hasValidAirQuality =
    data.airQuality === null ||
    data.airQuality === undefined ||
    (typeof data.airQuality === "object" &&
      typeof data.airQuality.aqi === "number" &&
      Number.isFinite(data.airQuality.aqi) &&
      typeof data.airQuality.aqiUnit === "string" &&
      typeof data.airQuality.pm25 === "number" &&
      Number.isFinite(data.airQuality.pm25) &&
      typeof data.airQuality.pm25Unit === "string" &&
      typeof data.airQuality.pm10 === "number" &&
      Number.isFinite(data.airQuality.pm10) &&
      typeof data.airQuality.pm10Unit === "string" &&
      typeof data.airQuality.time === "string" &&
      !Number.isNaN(Date.parse(data.airQuality.time)));

  if (
    typeof data.location !== "string" ||
    !hasValidAdministrative ||
    typeof data.timezone !== "string" ||
    typeof data.timezoneAbbreviation !== "string" ||
    typeof data.observationTime !== "string" ||
    Number.isNaN(Date.parse(data.observationTime)) ||
    typeof data.temperature !== "number" ||
    !Number.isFinite(data.temperature) ||
    typeof data.temperatureUnit !== "string" ||
    typeof data.apparentTemperature !== "number" ||
    !Number.isFinite(data.apparentTemperature) ||
    typeof data.apparentTemperatureUnit !== "string" ||
    typeof data.humidity !== "number" ||
    !Number.isFinite(data.humidity) ||
    typeof data.humidityUnit !== "string" ||
    typeof data.windSpeed !== "number" ||
    !Number.isFinite(data.windSpeed) ||
    typeof data.windSpeedUnit !== "string" ||
    typeof data.pressureUnit !== "string" ||
    typeof data.precipitation !== "number" ||
    !Number.isFinite(data.precipitation) ||
    typeof data.precipitationUnit !== "string" ||
    typeof data.uvIndex !== "number" ||
    !Number.isFinite(data.uvIndex) ||
    typeof data.uvIndexUnit !== "string" ||
    typeof data.weatherCode !== "number" ||
    !Number.isFinite(data.weatherCode) ||
    typeof data.isDay !== "boolean" ||
    !hasValidOptionalNumbers ||
    typeof data.dailyTemperatureUnit !== "string" ||
    !hasValidDailyForecast ||
    !hasValidCoordinates ||
    !hasValidAirQuality ||
    (data.localTime !== null &&
      data.localTime !== undefined &&
      (typeof data.localTime !== "string" ||
        Number.isNaN(Date.parse(data.localTime)))) ||
    (data.utcOffset !== null &&
      data.utcOffset !== undefined &&
      typeof data.utcOffset !== "string") ||
    (data.dayOfWeek !== null &&
      data.dayOfWeek !== undefined &&
      (typeof data.dayOfWeek !== "number" ||
        !Number.isInteger(data.dayOfWeek) ||
        data.dayOfWeek < 0 ||
        data.dayOfWeek > 6))
  ) {
    return null;
  }

  return {
    query: record.query,
    forecastDays:
      record.forecastDays === 7 || record.forecastDays === 14
        ? record.forecastDays
        : forecastLength > 7
          ? 14
          : 7,
    data: {
      ...data,
      pressure: typeof data.pressure === "number" ? data.pressure : Number.NaN,
      dailyHigh:
        typeof data.dailyHigh === "number" ? data.dailyHigh : Number.NaN,
      dailyLow: typeof data.dailyLow === "number" ? data.dailyLow : Number.NaN,
      airQuality: data.airQuality ?? null,
      localTime: data.localTime ?? null,
      utcOffset: data.utcOffset ?? null,
      dayOfWeek: data.dayOfWeek ?? null,
    } as WeatherData,
  };
}
