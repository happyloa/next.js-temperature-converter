import { describe, expect, it } from "vitest";

import type {
  AirQualityApiResponse,
  ForecastApiResponse,
  GeoApiLocation,
} from "./weatherApi";
import {
  buildWeatherData,
  mergeWeatherForecast,
  parseWeatherPayload,
} from "./weatherPayload";

const location: GeoApiLocation = {
  name: "Taipei",
  country: "Taiwan",
  admin1: "Taipei City",
  latitude: 25.04,
  longitude: 121.52,
  timezone: "Asia/Taipei",
};

const forecast: ForecastApiResponse = {
  current: {
    time: "2026-07-10T12:00",
    temperature_2m: 31,
    apparent_temperature: 35,
    relative_humidity_2m: 68,
    wind_speed_10m: 12,
    weather_code: 2,
    surface_pressure: 1003,
    precipitation: 0.2,
    uv_index: 7,
    is_day: 1,
  },
  current_units: {
    temperature_2m: "°C",
    apparent_temperature: "°C",
    relative_humidity_2m: "%",
    wind_speed_10m: "km/h",
    surface_pressure: "hPa",
    precipitation: "mm",
    uv_index: "",
  },
  daily: {
    time: ["2026-07-10", "2026-07-11"],
    temperature_2m_max: [34, 33],
    temperature_2m_min: [27, 26],
  },
  daily_units: {
    temperature_2m_max: "°C",
    temperature_2m_min: "°C",
  },
  timezone: "Asia/Taipei",
  timezone_abbreviation: "GMT+8",
  utc_offset_seconds: 28800,
};

const airQuality: AirQualityApiResponse = {
  current: {
    european_aqi: 42,
    pm2_5: 12.5,
    pm10: 24,
    time: "2026-07-10T12:00",
  },
  current_units: {
    european_aqi: "EAQI",
    pm2_5: "µg/m³",
    pm10: "µg/m³",
  },
};

describe("weather payload", () => {
  it("builds display data from Open-Meteo responses", () => {
    const result = buildWeatherData(location, forecast, airQuality);

    expect(result).toMatchObject({
      location: "Taipei · Taiwan",
      administrative: ["Taipei City"],
      timezone: "Asia/Taipei",
      utcOffset: "+08:00",
      temperature: 31,
      pressure: 1003,
    });
    expect(result.airQuality?.aqi).toBe(42);
    expect(result.dailyForecast).toEqual([
      { date: "2026-07-10", high: 34, low: 27 },
      { date: "2026-07-11", high: 33, low: 26 },
    ]);
  });

  it("replaces only forecast-related fields when the range changes", () => {
    const current = buildWeatherData(location, forecast, airQuality);
    const nextForecast: ForecastApiResponse = {
      ...forecast,
      daily: {
        time: ["2026-07-10"],
        temperature_2m_max: [36],
        temperature_2m_min: [28],
      },
    };

    const result = mergeWeatherForecast(current, nextForecast);

    expect(result.temperature).toBe(current.temperature);
    expect(result.airQuality).toEqual(current.airQuality);
    expect(result.dailyHigh).toBe(36);
    expect(result.dailyForecast).toEqual([
      { date: "2026-07-10", high: 36, low: 28 },
    ]);
  });

  it("accepts valid cached data and rejects incomplete payloads", () => {
    const data = buildWeatherData(location, forecast, airQuality);
    const serialized = JSON.parse(
      JSON.stringify({ query: "Taipei", data, forecastDays: 14 }),
    );

    expect(parseWeatherPayload(serialized)?.data.location).toBe(
      "Taipei · Taiwan",
    );
    expect(parseWeatherPayload(serialized)?.forecastDays).toBe(14);
    expect(parseWeatherPayload({ query: "Taipei", data: {} })).toBeNull();
    expect(parseWeatherPayload(null)).toBeNull();
  });

  it("infers legacy forecast ranges and rejects unsafe cached values", () => {
    const dates = Array.from(
      { length: 14 },
      (_, index) => `2026-07-${String(10 + index).padStart(2, "0")}`,
    );
    const legacyData = buildWeatherData(
      location,
      {
        ...forecast,
        daily: {
          time: dates,
          temperature_2m_max: dates.map(() => 32),
          temperature_2m_min: dates.map(() => 25),
        },
      },
      airQuality,
    );

    expect(
      parseWeatherPayload({ query: "Taipei", data: legacyData })?.forecastDays,
    ).toBe(14);
    expect(
      parseWeatherPayload({
        query: "Taipei",
        data: { ...legacyData, temperature: Number.POSITIVE_INFINITY },
      }),
    ).toBeNull();
    expect(
      parseWeatherPayload({
        query: "Taipei",
        data: { ...legacyData, observationTime: "not-a-date" },
      }),
    ).toBeNull();
  });
});
