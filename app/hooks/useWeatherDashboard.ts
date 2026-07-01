"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

import { readWithFallback, writeWithFallback } from "../lib/storage";
import {
  fetchAirQuality,
  fetchForecast,
  reverseGeocode,
  searchLocation,
} from "../lib/weatherApi";
import { buildWeatherData, parseWeatherPayload } from "../lib/weatherPayload";
import type { WeatherData } from "../types/weather";

const WEATHER_STORAGE_KEY = "weather-dashboard-state";

/**
 * 整合地理、天氣、空氣品質與時間 API 的 hook，提供統一的查詢介面。
 * 實際的 API 存取邏輯在 lib/weatherApi.ts，資料轉換/驗證邏輯在
 * lib/weatherPayload.ts；這裡只負責 React 狀態與流程協調。
 */
export function useWeatherDashboard(defaultQuery: string) {
  const [weatherQuery, setWeatherQuery] = useState<string>(defaultQuery);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [forecastDays, setForecastDays] = useState<7 | 14>(7);
  const [geolocating, setGeolocating] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const storageRef = useRef<"local" | "session">("local");
  const previousQueryRef = useRef<string>(defaultQuery);
  const hasDataRef = useRef(false);

  const persistWeather = useCallback(
    (payload: { query: string; data: WeatherData }) => {
      const succeededWith = writeWithFallback(
        WEATHER_STORAGE_KEY,
        JSON.stringify(payload),
        storageRef.current,
      );
      if (succeededWith) {
        storageRef.current = succeededWith;
      }
    },
    [],
  );

  const fetchWeather = useCallback(
    async (query: string, days: 7 | 14 = forecastDays) => {
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;
      const signal = controller.signal;

      const trimmed = query.trim();
      if (!trimmed) {
        setWeatherError("請輸入地點名稱");
        setWeatherData(null);
        setWeatherLoading(false);
        return;
      }

      const isSameQuery =
        hasDataRef.current && query === previousQueryRef.current;
      previousQueryRef.current = query;

      if (isSameQuery) {
        setForecastLoading(true);
      } else {
        setWeatherLoading(true);
      }
      setWeatherError(null);

      try {
        const location = await searchLocation(trimmed, signal);
        const requestTimezone = location.timezone ?? "auto";

        const [forecast, airQuality] = await Promise.all([
          fetchForecast(
            location.latitude,
            location.longitude,
            requestTimezone,
            days,
            signal,
          ),
          fetchAirQuality(location.latitude, location.longitude, signal),
        ]);

        const nextData = buildWeatherData(location, forecast, airQuality);
        const normalizedQuery = trimmed;

        setWeatherQuery(normalizedQuery);
        setWeatherData(nextData);
        hasDataRef.current = true;
        persistWeather({ query: normalizedQuery, data: nextData });
      } catch (error) {
        if (
          signal.aborted ||
          (error instanceof DOMException && error.name === "AbortError")
        ) {
          return;
        }

        console.error("fetchWeather", error);
        setWeatherData(null);
        const message =
          error instanceof Error
            ? error.message
            : "無法取得天氣資訊，請稍後再試。";
        setWeatherError(message);
      } finally {
        if (signal.aborted) {
          return;
        }
        setWeatherLoading(false);
        setForecastLoading(false);
      }
    },
    [persistWeather, forecastDays],
  );

  useEffect(() => {
    const restored = readWithFallback(WEATHER_STORAGE_KEY, parseWeatherPayload);

    if (restored) {
      const { query, data } = restored.data;
      setWeatherQuery(query);
      setWeatherData(data);
      hasDataRef.current = true;
      storageRef.current = restored.name;
    }

    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    // Initial fetch or when query/days changes
    fetchWeather(weatherQuery);
  }, [fetchWeather, hydrated, weatherQuery, forecastDays]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const handleWeatherSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      fetchWeather(weatherQuery);
    },
    [fetchWeather, weatherQuery],
  );

  const handleWeatherPreset = useCallback(
    (preset: string) => {
      setWeatherQuery(preset);
      fetchWeather(preset);
    },
    [fetchWeather],
  );

  const handleGeolocate = useCallback(async () => {
    if (!("geolocation" in navigator)) {
      console.error("Geolocation not supported");
      setWeatherError("您的瀏覽器不支援地理位置功能");
      return;
    }

    setGeolocating(true);
    setWeatherError(null);

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve(pos),
            (err) => {
              console.error("Position error", err);
              reject(err);
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 300000, // 快取 5 分鐘
            },
          );
        },
      );

      const { latitude, longitude } = position.coords;
      const reverseName = await reverseGeocode(latitude, longitude);
      const locationName =
        reverseName ?? `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;

      setWeatherQuery(locationName);
      await fetchWeather(locationName);
    } catch (error) {
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setWeatherError("位置存取權限被拒絕，請在瀏覽器設定中允許");
            break;
          case error.POSITION_UNAVAILABLE:
            setWeatherError("無法取得位置資訊");
            break;
          case error.TIMEOUT:
            setWeatherError("取得位置逾時，請再試一次");
            break;
          default:
            setWeatherError("取得位置時發生錯誤");
        }
      } else {
        setWeatherError("取得位置時發生錯誤");
      }
    } finally {
      setGeolocating(false);
    }
  }, [fetchWeather]);

  return {
    weatherQuery,
    setWeatherQuery,
    weatherData,
    weatherLoading,
    weatherError,
    forecastLoading,
    fetchWeather,
    handleWeatherSubmit,
    handleWeatherPreset,
    handleGeolocate,
    geolocating,
    forecastDays,
    setForecastDays,
  };
}
