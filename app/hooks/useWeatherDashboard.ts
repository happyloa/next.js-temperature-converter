"use client";

import {
  startTransition,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { FormEvent } from "react";

import { readWithFallback, writeWithFallback } from "../lib/storage";
import {
  fetchAirQuality,
  fetchForecast,
  searchLocation,
  searchLocations,
} from "../lib/weatherApi";
import type { GeoApiLocation } from "../lib/weatherApi";
import {
  buildWeatherData,
  mergeWeatherForecast,
  parseWeatherPayload,
} from "../lib/weatherPayload";
import type { WeatherData } from "../types/weather";

const WEATHER_STORAGE_KEY = "weather-dashboard-state";
const SUGGESTION_DELAY_MS = 350;

export function useWeatherDashboard(defaultQuery: string) {
  const [weatherQuery, setWeatherQuery] = useState(defaultQuery);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [forecastDays, setForecastDaysState] = useState<7 | 14>(7);
  const [geolocating, setGeolocating] = useState(false);
  const [suggestions, setSuggestions] = useState<GeoApiLocation[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);

  const requestControllerRef = useRef<AbortController | null>(null);
  const suggestionControllerRef = useRef<AbortController | null>(null);
  const storageRef = useRef<"local" | "session">("local");
  const committedQueryRef = useRef(defaultQuery);

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
        committedQueryRef.current = trimmed;
        setWeatherQuery(trimmed);
        setWeatherData(nextData);
        setSuggestions([]);
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
    [persistWeather],
  );

  useEffect(() => {
    const restored = readWithFallback(WEATHER_STORAGE_KEY, parseWeatherPayload);
    const initialQuery = restored?.data.query ?? defaultQuery;
    if (restored) {
      startTransition(() => {
        setWeatherQuery(restored.data.query);
        setWeatherData(restored.data.data);
      });
      storageRef.current = restored.name;
      committedQueryRef.current = restored.data.query;
    }

    const initialRequest = window.setTimeout(() => {
      void fetchWeather(initialQuery, 7);
    }, 0);

    return () => window.clearTimeout(initialRequest);
  }, [defaultQuery, fetchWeather]);

  useEffect(() => {
    const trimmed = weatherQuery.trim();
    suggestionControllerRef.current?.abort();

    if (trimmed.length < 2 || trimmed === committedQueryRef.current) {
      startTransition(() => {
        setSuggestions([]);
        setSuggestionsLoading(false);
      });
      return;
    }

    const timer = window.setTimeout(async () => {
      const controller = new AbortController();
      suggestionControllerRef.current = controller;
      setSuggestionsLoading(true);

      try {
        const nextSuggestions = await searchLocations(
          trimmed,
          5,
          controller.signal,
        );
        setSuggestions(nextSuggestions);
        setSuggestionsOpen(true);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          console.error("searchLocations", error);
        }
      } finally {
        if (suggestionControllerRef.current === controller) {
          setSuggestionsLoading(false);
        }
      }
    }, SUGGESTION_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [weatherQuery]);

  useEffect(
    () => () => {
      requestControllerRef.current?.abort();
      suggestionControllerRef.current?.abort();
    },
    [],
  );

  const handleWeatherQueryChange = useCallback((value: string) => {
    setWeatherQuery(value);
    setWeatherError(null);
  }, []);

  const handleWeatherSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      void fetchWeather(weatherQuery, forecastDays);
    },
    [fetchWeather, forecastDays, weatherQuery],
  );

  const handleWeatherPreset = useCallback(
    (preset: string) => {
      setWeatherQuery(preset);
      void fetchWeather(preset, forecastDays);
    },
    [fetchWeather, forecastDays],
  );

  const handleSuggestionSelect = useCallback(
    (location: GeoApiLocation) => {
      setWeatherQuery(location.name);
      void fetchWeather(location.name, forecastDays, location);
    },
    [fetchWeather, forecastDays],
  );

  const handleForecastDaysChange = useCallback(
    async (days: 7 | 14) => {
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
        persistWeather({ query: weatherQuery, data: nextData });
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
    },
    [forecastDays, persistWeather, weatherData, weatherQuery],
  );

  const handleGeolocate = useCallback(async () => {
    if (!("geolocation" in navigator)) {
      setWeatherError("您的瀏覽器不支援地理位置功能");
      return;
    }

    setGeolocating(true);
    setWeatherError(null);

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000,
          });
        },
      );
      const { latitude, longitude } = position.coords;
      const location: GeoApiLocation = {
        name: "目前位置",
        latitude,
        longitude,
      };
      setWeatherQuery(location.name);
      await fetchWeather(location.name, forecastDays, location);
    } catch (error) {
      const code = (error as GeolocationPositionError | undefined)?.code;
      if (code === 1) {
        setWeatherError("位置存取權限被拒絕，請在瀏覽器設定中允許");
      } else if (code === 2) {
        setWeatherError("無法取得位置資訊");
      } else if (code === 3) {
        setWeatherError("取得位置逾時，請再試一次");
      } else {
        setWeatherError("取得位置時發生錯誤");
      }
    } finally {
      setGeolocating(false);
    }
  }, [fetchWeather, forecastDays]);

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
