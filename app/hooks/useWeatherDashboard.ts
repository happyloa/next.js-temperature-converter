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
import type { WeatherData, WeatherLocationSource } from "../types/weather";
import { useWeatherSuggestions } from "./useWeatherSuggestions";

const WEATHER_STORAGE_KEY = "weather-dashboard-state";
const GENERIC_WEATHER_ERROR = "無法取得天氣資訊，請稍後再試。";
export const WEATHER_CACHE_TTL_MS = 10 * 60 * 1000;

const getRequestErrorMessage = (error: unknown): string =>
  error instanceof Error && error.name === "WeatherApiError"
    ? error.message
    : GENERIC_WEATHER_ERROR;

const getCacheRemainingMs = (fetchedAt: string): number => {
  const fetchedAtMs = Date.parse(fetchedAt);
  if (Number.isNaN(fetchedAtMs)) return 0;
  return Math.max(0, WEATHER_CACHE_TTL_MS - (Date.now() - fetchedAtMs));
};

const getStoredLocation = (
  query: string,
  data: WeatherData,
): GeoApiLocation | null => {
  if (!data.coordinates) return null;
  return {
    name: query,
    latitude: data.coordinates.latitude,
    longitude: data.coordinates.longitude,
    timezone: data.timezone,
  };
};

const clearLocalWeatherCache = () => {
  try {
    window.localStorage.removeItem(WEATHER_STORAGE_KEY);
  } catch {
    // A strict privacy mode may disallow access. Never fall back to local
    // storage for a current-location result.
  }
};

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
  const [weatherStale, setWeatherStale] = useState(false);

  const requestControllerRef = useRef<AbortController | null>(null);
  const cacheRefreshTimerRef = useRef<number | null>(null);
  const operationIdRef = useRef(0);
  const lastLocationRef = useRef<GeoApiLocation | null>(null);
  const locationSourceRef = useRef<WeatherLocationSource>("search");
  const {
    suggestions,
    suggestionsLoading,
    suggestionsOpen,
    setSuggestionsOpen,
  } = useWeatherSuggestions(weatherQuery, committedQuery, suggestionsEnabled);

  const persistWeather = useCallback(
    (payload: { query: string; data: WeatherData; forecastDays: 7 | 14 }) => {
      const isCurrentLocation = payload.data.locationSource === "geolocation";
      if (isCurrentLocation) clearLocalWeatherCache();

      const succeededWith = writeWithFallback(
        WEATHER_STORAGE_KEY,
        JSON.stringify(payload),
        isCurrentLocation ? "session" : "local",
        { allowFallback: !isCurrentLocation },
      );
      if (!succeededWith && isCurrentLocation) {
        console.warn("Current location is available only for this view.");
      }
    },
    [],
  );

  const beginRequest = useCallback(() => {
    if (cacheRefreshTimerRef.current !== null) {
      window.clearTimeout(cacheRefreshTimerRef.current);
      cacheRefreshTimerRef.current = null;
    }
    operationIdRef.current += 1;
    requestControllerRef.current?.abort();
    const controller = new AbortController();
    requestControllerRef.current = controller;
    return { controller, operationId: operationIdRef.current };
  }, []);

  const invalidateActiveOperation = useCallback(() => {
    if (cacheRefreshTimerRef.current !== null) {
      window.clearTimeout(cacheRefreshTimerRef.current);
      cacheRefreshTimerRef.current = null;
    }
    operationIdRef.current += 1;
    requestControllerRef.current?.abort();
    requestControllerRef.current = null;
    setWeatherLoading(false);
    setForecastLoading(false);
    setGeolocating(false);
  }, []);

  const fetchWeather = useCallback(
    async (
      query: string,
      days: 7 | 14,
      providedLocation?: GeoApiLocation,
      locationSource: WeatherLocationSource = "search",
    ) => {
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
      setWeatherStale(true);
      setSuggestionsEnabled(false);
      setSuggestionsOpen(false);
      locationSourceRef.current = locationSource;
      lastLocationRef.current = providedLocation ?? null;

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

        const fetchedAt = new Date().toISOString();
        const weatherBuildOptions = { fetchedAt, locationSource };
        const nextData = buildWeatherData(
          location,
          forecast,
          null,
          weatherBuildOptions,
        );
        lastLocationRef.current = location;
        setCommittedQuery(trimmed);
        setWeatherQuery(trimmed);
        setForecastDaysState(days);
        setWeatherData(nextData);
        setWeatherStale(false);
        persistWeather({ query: trimmed, data: nextData, forecastDays: days });

        airQualityStarted = true;
        void fetchAirQuality(location.latitude, location.longitude, signal)
          .then((airQuality) => {
            if (!airQuality || !isCurrent()) return;
            const enrichedData = buildWeatherData(
              location,
              forecast,
              airQuality,
              weatherBuildOptions,
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
        setWeatherStale(true);
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
    const restored = readWithFallback(
      WEATHER_STORAGE_KEY,
      parseWeatherPayload,
      "session",
    );
    const initialQuery = restored?.data.query ?? defaultQuery;
    const initialDays = restored?.data.forecastDays ?? 7;
    const initialSource = restored?.data.data.locationSource ?? "search";
    const initialLocation = restored
      ? getStoredLocation(initialQuery, restored.data.data)
      : null;
    const refreshDelay = restored
      ? getCacheRemainingMs(restored.data.data.fetchedAt)
      : 0;
    if (restored) {
      startTransition(() => {
        setWeatherQuery(restored.data.query);
        setWeatherData(restored.data.data);
        setForecastDaysState(restored.data.forecastDays);
        setCommittedQuery(restored.data.query);
        setWeatherStale(refreshDelay === 0);
      });
      lastLocationRef.current = initialLocation;
      locationSourceRef.current = initialSource;

      // Migrate legacy current-location records out of localStorage. If
      // sessionStorage is unavailable, discard the old persistent copy rather
      // than retaining a precise location beyond the session.
      if (initialSource === "geolocation" && restored.name === "local") {
        persistWeather(restored.data);
      }
    }

    const initialRequest = window.setTimeout(() => {
      void fetchWeather(
        initialQuery,
        initialDays,
        initialSource === "geolocation"
          ? (initialLocation ?? undefined)
          : undefined,
        initialSource,
      );
    }, refreshDelay);
    cacheRefreshTimerRef.current = initialRequest;

    return () => {
      window.clearTimeout(initialRequest);
      if (cacheRefreshTimerRef.current === initialRequest) {
        cacheRefreshTimerRef.current = null;
      }
    };
  }, [defaultQuery, fetchWeather, persistWeather]);

  useEffect(
    () => () => {
      operationIdRef.current += 1;
      requestControllerRef.current?.abort();
    },
    [],
  );

  const handleWeatherQueryChange = (value: string) => {
    invalidateActiveOperation();
    locationSourceRef.current = "search";
    lastLocationRef.current = null;
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
      void fetchWeather(location.name, forecastDays, location, "geolocation");
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

  const retryWeather = () => {
    const locationSource = locationSourceRef.current;
    const retryLocation =
      locationSource === "geolocation"
        ? (lastLocationRef.current ??
          (weatherData ? getStoredLocation(weatherQuery, weatherData) : null))
        : undefined;
    void fetchWeather(
      weatherQuery,
      forecastDays,
      retryLocation ?? undefined,
      locationSource,
    );
  };

  return {
    weatherQuery,
    weatherData,
    weatherStale,
    weatherLoading,
    weatherError,
    forecastLoading,
    fetchWeather,
    retryWeather,
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
