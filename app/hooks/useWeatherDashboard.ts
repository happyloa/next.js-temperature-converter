"use client";

import {
  startTransition,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { FormEvent } from "react";

import {
  getGeolocationErrorMessage,
  requestCurrentPosition,
} from "../lib/geolocation";
import { readWithFallback, writeWithFallback } from "../lib/storage";
import {
  fetchAirQuality,
  fetchForecast,
  searchLocation,
} from "../lib/weatherApi";
import type { GeoApiLocation } from "../lib/weatherApi";
import {
  buildWeatherData,
  mergeWeatherForecast,
  parseWeatherPayload,
} from "../lib/weatherPayload";
import type { WeatherData } from "../types/weather";
import { useWeatherSuggestions } from "./useWeatherSuggestions";

const WEATHER_STORAGE_KEY = "weather-dashboard-state";

export function useWeatherDashboard(defaultQuery: string) {
  const [weatherQuery, setWeatherQuery] = useState(defaultQuery);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [forecastDays, setForecastDaysState] = useState<7 | 14>(7);
  const [geolocating, setGeolocating] = useState(false);
  const [committedQuery, setCommittedQuery] = useState(defaultQuery);
  const [suggestionsEnabled, setSuggestionsEnabled] = useState(false);

  const requestControllerRef = useRef<AbortController | null>(null);
  const storageRef = useRef<"local" | "session">("local");
  const {
    suggestions,
    suggestionsLoading,
    suggestionsOpen,
    setSuggestionsOpen,
  } = useWeatherSuggestions(weatherQuery, committedQuery, suggestionsEnabled);

  const persistWeather = useCallback(
    (payload: { query: string; data: WeatherData }) => {
      const succeededWith = writeWithFallback(
        WEATHER_STORAGE_KEY,
        JSON.stringify(payload),
        storageRef.current,
      );
      if (succeededWith) storageRef.current = succeededWith;
    },
    [],
  );

  const fetchWeather = useCallback(
    async (query: string, days: 7 | 14, providedLocation?: GeoApiLocation) => {
      const trimmed = query.trim();
      if (!trimmed) {
        setWeatherError("請輸入地點名稱");
        return;
      }

      requestControllerRef.current?.abort();
      const controller = new AbortController();
      requestControllerRef.current = controller;
      const { signal } = controller;

      setWeatherLoading(true);
      setForecastLoading(false);
      setWeatherError(null);
      setSuggestionsEnabled(false);
      setSuggestionsOpen(false);

      try {
        const location =
          providedLocation ?? (await searchLocation(trimmed, signal));
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
        setCommittedQuery(trimmed);
        setWeatherQuery(trimmed);
        setWeatherData(nextData);
        persistWeather({ query: trimmed, data: nextData });
      } catch (error) {
        if (
          signal.aborted ||
          (error instanceof DOMException && error.name === "AbortError")
        ) {
          return;
        }
        console.error("fetchWeather", error);
        setWeatherError(
          error instanceof Error
            ? error.message
            : "無法取得天氣資訊，請稍後再試。",
        );
      } finally {
        if (requestControllerRef.current === controller) {
          setWeatherLoading(false);
        }
      }
    },
    [persistWeather, setSuggestionsOpen],
  );

  useEffect(() => {
    const restored = readWithFallback(WEATHER_STORAGE_KEY, parseWeatherPayload);
    const initialQuery = restored?.data.query ?? defaultQuery;
    if (restored) {
      startTransition(() => {
        setWeatherQuery(restored.data.query);
        setWeatherData(restored.data.data);
        setCommittedQuery(restored.data.query);
      });
      storageRef.current = restored.name;
    }

    const initialRequest = window.setTimeout(() => {
      void fetchWeather(initialQuery, 7);
    }, 0);

    return () => window.clearTimeout(initialRequest);
  }, [defaultQuery, fetchWeather]);

  useEffect(() => () => requestControllerRef.current?.abort(), []);

  const handleWeatherQueryChange = (value: string) => {
    setWeatherQuery(value);
    setWeatherError(null);
    setSuggestionsEnabled(true);
  };

  const handleWeatherSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void fetchWeather(weatherQuery, forecastDays);
  };

  const handleWeatherPreset = (preset: string) => {
    setWeatherQuery(preset);
    void fetchWeather(preset, forecastDays);
  };

  const handleSuggestionSelect = (location: GeoApiLocation) => {
    setWeatherQuery(location.name);
    void fetchWeather(location.name, forecastDays, location);
  };

  const handleForecastDaysChange = async (days: 7 | 14) => {
    if (days === forecastDays) return;
    setForecastDaysState(days);

    if (!weatherData?.coordinates) return;
    requestControllerRef.current?.abort();
    const controller = new AbortController();
    requestControllerRef.current = controller;
    setForecastLoading(true);
    setWeatherError(null);

    try {
      const forecast = await fetchForecast(
        weatherData.coordinates.latitude,
        weatherData.coordinates.longitude,
        weatherData.timezone || "auto",
        days,
        controller.signal,
      );
      const nextData = mergeWeatherForecast(weatherData, forecast);
      setWeatherData(nextData);
      persistWeather({ query: committedQuery, data: nextData });
    } catch (error) {
      if (
        !controller.signal.aborted &&
        !(error instanceof DOMException && error.name === "AbortError")
      ) {
        setWeatherError("無法更新預報天數，目前仍顯示先前資料。");
      }
    } finally {
      if (requestControllerRef.current === controller) {
        setForecastLoading(false);
      }
    }
  };

  const handleGeolocate = async () => {
    if (!("geolocation" in navigator)) {
      setWeatherError("您的瀏覽器不支援地理位置功能");
      return;
    }

    setGeolocating(true);
    setWeatherError(null);
    setSuggestionsEnabled(false);
    setSuggestionsOpen(false);

    try {
      const position = await requestCurrentPosition(navigator.geolocation);
      const { latitude, longitude } = position.coords;
      const location: GeoApiLocation = {
        name: "目前位置",
        latitude,
        longitude,
      };
      setWeatherQuery(location.name);
      await fetchWeather(location.name, forecastDays, location);
    } catch (error) {
      setWeatherError(getGeolocationErrorMessage(error));
    } finally {
      setGeolocating(false);
    }
  };

  return {
    weatherQuery,
    weatherData,
    weatherLoading,
    weatherError,
    forecastLoading,
    fetchWeather,
    handleWeatherQueryChange,
    handleWeatherSubmit,
    handleWeatherPreset,
    handleSuggestionSelect,
    handleGeolocate,
    geolocating,
    forecastDays,
    setForecastDays: handleForecastDaysChange,
    suggestions,
    suggestionsLoading,
    suggestionsOpen,
    setSuggestionsOpen,
  };
}
