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
import { isAbortError } from "../lib/async";
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
const GENERIC_WEATHER_ERROR = "無法取得天氣資訊，請稍後再試。";

const getRequestErrorMessage = (error: unknown): string =>
  error instanceof Error && error.name === "WeatherApiError"
    ? error.message
    : GENERIC_WEATHER_ERROR;

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
  const operationIdRef = useRef(0);
  const storageRef = useRef<"local" | "session">("local");
  const {
    suggestions,
    suggestionsLoading,
    suggestionsOpen,
    setSuggestionsOpen,
  } = useWeatherSuggestions(weatherQuery, committedQuery, suggestionsEnabled);

  const persistWeather = useCallback(
    (payload: { query: string; data: WeatherData; forecastDays: 7 | 14 }) => {
      const succeededWith = writeWithFallback(
        WEATHER_STORAGE_KEY,
        JSON.stringify(payload),
        storageRef.current,
      );
      if (succeededWith) storageRef.current = succeededWith;
    },
    [],
  );

  const beginRequest = useCallback(() => {
    operationIdRef.current += 1;
    requestControllerRef.current?.abort();
    const controller = new AbortController();
    requestControllerRef.current = controller;
    return { controller, operationId: operationIdRef.current };
  }, []);

  const invalidateActiveOperation = useCallback(() => {
    operationIdRef.current += 1;
    requestControllerRef.current?.abort();
    requestControllerRef.current = null;
    setWeatherLoading(false);
    setForecastLoading(false);
    setGeolocating(false);
  }, []);

  const fetchWeather = useCallback(
    async (query: string, days: 7 | 14, providedLocation?: GeoApiLocation) => {
      const trimmed = query.trim();
      if (!trimmed) {
        setWeatherError("請輸入地點名稱");
        return;
      }

      const { controller, operationId } = beginRequest();
      const { signal } = controller;
      const isCurrent = () =>
        operationIdRef.current === operationId && !signal.aborted;
      let airQualityStarted = false;

      setWeatherLoading(true);
      setForecastLoading(false);
      setGeolocating(false);
      setWeatherError(null);
      setSuggestionsEnabled(false);
      setSuggestionsOpen(false);

      try {
        const location =
          providedLocation ?? (await searchLocation(trimmed, signal));
        const requestTimezone = location.timezone ?? "auto";
        const forecast = await fetchForecast(
          location.latitude,
          location.longitude,
          requestTimezone,
          days,
          signal,
        );

        if (!isCurrent()) return;

        const nextData = buildWeatherData(location, forecast, null);
        setCommittedQuery(trimmed);
        setWeatherQuery(trimmed);
        setForecastDaysState(days);
        setWeatherData(nextData);
        persistWeather({ query: trimmed, data: nextData, forecastDays: days });

        airQualityStarted = true;
        void fetchAirQuality(location.latitude, location.longitude, signal)
          .then((airQuality) => {
            if (!airQuality || !isCurrent()) return;
            const enrichedData = buildWeatherData(
              location,
              forecast,
              airQuality,
            );
            setWeatherData(enrichedData);
            persistWeather({
              query: trimmed,
              data: enrichedData,
              forecastDays: days,
            });
          })
          .catch((error) => {
            if (isCurrent() && !isAbortError(error)) {
              console.error("fetchAirQuality", error);
            }
          })
          .finally(() => {
            if (requestControllerRef.current === controller) {
              requestControllerRef.current = null;
            }
          });
      } catch (error) {
        if (!isCurrent() || isAbortError(error)) return;
        console.error("fetchWeather", error);
        setWeatherError(getRequestErrorMessage(error));
      } finally {
        if (isCurrent()) setWeatherLoading(false);
        if (!airQualityStarted && requestControllerRef.current === controller) {
          requestControllerRef.current = null;
        }
      }
    },
    [beginRequest, persistWeather, setSuggestionsOpen],
  );

  useEffect(() => {
    const restored = readWithFallback(WEATHER_STORAGE_KEY, parseWeatherPayload);
    const initialQuery = restored?.data.query ?? defaultQuery;
    const initialDays = restored?.data.forecastDays ?? 7;
    if (restored) {
      startTransition(() => {
        setWeatherQuery(restored.data.query);
        setWeatherData(restored.data.data);
        setForecastDaysState(restored.data.forecastDays);
        setCommittedQuery(restored.data.query);
      });
      storageRef.current = restored.name;
    }

    const initialRequest = window.setTimeout(() => {
      void fetchWeather(initialQuery, initialDays);
    }, 0);

    return () => window.clearTimeout(initialRequest);
  }, [defaultQuery, fetchWeather]);

  useEffect(
    () => () => {
      operationIdRef.current += 1;
      requestControllerRef.current?.abort();
    },
    [],
  );

  const handleWeatherQueryChange = (value: string) => {
    invalidateActiveOperation();
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
    if (!weatherData?.coordinates) {
      setForecastDaysState(days);
      return;
    }

    const { controller, operationId } = beginRequest();
    const isCurrent = () =>
      operationIdRef.current === operationId && !controller.signal.aborted;
    setWeatherLoading(false);
    setForecastLoading(true);
    setGeolocating(false);
    setWeatherError(null);

    try {
      const forecast = await fetchForecast(
        weatherData.coordinates.latitude,
        weatherData.coordinates.longitude,
        weatherData.timezone || "auto",
        days,
        controller.signal,
      );
      if (!isCurrent()) return;

      const nextData = mergeWeatherForecast(weatherData, forecast);
      setWeatherData(nextData);
      setForecastDaysState(days);
      persistWeather({
        query: committedQuery,
        data: nextData,
        forecastDays: days,
      });
    } catch (error) {
      if (isCurrent() && !isAbortError(error)) {
        setWeatherError("無法更新預報天數，目前仍顯示先前資料。");
      }
    } finally {
      if (isCurrent()) {
        setForecastLoading(false);
        if (requestControllerRef.current === controller) {
          requestControllerRef.current = null;
        }
      }
    }
  };

  const handleGeolocate = async () => {
    if (!("geolocation" in navigator)) {
      setWeatherError("您的瀏覽器不支援地理位置功能");
      return;
    }

    invalidateActiveOperation();
    operationIdRef.current += 1;
    const geolocationOperationId = operationIdRef.current;
    setGeolocating(true);
    setWeatherError(null);
    setSuggestionsEnabled(false);
    setSuggestionsOpen(false);

    try {
      const position = await requestCurrentPosition(navigator.geolocation);
      if (operationIdRef.current !== geolocationOperationId) return;

      const { latitude, longitude } = position.coords;
      const location: GeoApiLocation = {
        name: "目前位置",
        latitude,
        longitude,
      };
      setGeolocating(false);
      setWeatherQuery(location.name);
      void fetchWeather(location.name, forecastDays, location);
    } catch (error) {
      if (operationIdRef.current === geolocationOperationId) {
        setWeatherError(getGeolocationErrorMessage(error));
      }
    } finally {
      if (operationIdRef.current === geolocationOperationId) {
        setGeolocating(false);
      }
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
