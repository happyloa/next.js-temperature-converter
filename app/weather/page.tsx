"use client";

import { useMemo } from "react";
import { cn } from "../lib/utils";
import { WeatherChart } from "../components/WeatherChart";
import { WeatherSkeleton } from "../components/skeletons/WeatherSkeleton";
import { ChartGraphicSkeleton } from "../components/skeletons/ChartSkeleton";
import { useWeatherDashboard } from "../hooks/useWeatherDashboard";
import { getWeatherDescription, WEATHER_PRESETS } from "../lib/weather";
import {
  formatLocalClock,
  formatOptionalMetric,
  formatUtcOffset,
} from "../lib/format";

const WEEKDAY_LABELS = ["週日", "週一", "週二", "週三", "週四", "週五", "週六"];

export default function WeatherPage() {
  const {
    weatherQuery,
    setWeatherQuery,
    weatherData,
    weatherLoading,
    weatherError,
    fetchWeather,
    handleWeatherSubmit,
    handleWeatherPreset,
    handleGeolocate,
    geolocating,
    forecastDays,
    setForecastDays,
    forecastLoading,
  } = useWeatherDashboard("Taipei");

  const climateHighlights = useMemo(() => {
    if (!weatherData) return [];
    return [
      {
        label: "體感溫度",
        value: weatherData.apparentTemperature,
        unit: weatherData.apparentTemperatureUnit ?? "°C",
        icon: "🌡️",
        desc: "實際感受",
      },
      {
        label: "紫外線",
        value: weatherData.uvIndex,
        unit: weatherData.uvIndexUnit ?? "",
        icon: "☀️",
        desc:
          weatherData.uvIndex > 11
            ? "危險級"
            : weatherData.uvIndex > 8
              ? "過量級"
              : "一般",
      },
      {
        label: "降雨量",
        value: weatherData.precipitation,
        unit: weatherData.precipitationUnit ?? "mm",
        icon: "🌧️",
        desc: "過去一小時",
      },
    ].filter((item) => Number.isFinite(item.value));
  }, [weatherData]);

  const environmentMetrics = useMemo(() => {
    if (!weatherData) return [];
    return [
      {
        label: "相對濕度",
        value: weatherData.humidity,
        unit: weatherData.humidityUnit ?? "%",
        icon: "💧",
      },
      {
        label: "風速",
        value: weatherData.windSpeed,
        unit: weatherData.windSpeedUnit
          ? ` ${weatherData.windSpeedUnit}`
          : " m/s",
        icon: "🌬️",
      },
      {
        label: "氣壓",
        value: weatherData.pressure,
        unit: weatherData.pressureUnit
          ? ` ${weatherData.pressureUnit}`
          : " hPa",
        icon: "📉",
      },
    ].filter((item) => Number.isFinite(item.value));
  }, [weatherData]);

  const coordinatesText = weatherData?.coordinates
    ? `${Math.abs(weatherData.coordinates.latitude)}°${weatherData.coordinates.latitude >= 0 ? "N" : "S"} · ${Math.abs(weatherData.coordinates.longitude)}°${weatherData.coordinates.longitude >= 0 ? "E" : "W"}`
    : null;

  const weekdayLabel =
    weatherData?.dayOfWeek !== null && weatherData?.dayOfWeek !== undefined
      ? WEEKDAY_LABELS[weatherData.dayOfWeek]
      : null;

  return (
    <main className="text-ink-strong selection:bg-accent/30 w-full transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Page toolbar: title + city search */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-heading text-ink-strong">全球環境監測中心</h1>

          <form
            onSubmit={handleWeatherSubmit}
            className="relative w-full sm:max-w-md"
          >
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="text-ink-subtle group-focus-within:text-accent h-4 w-4 transition-colors"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <input
                type="text"
                value={weatherQuery}
                onChange={(e) => setWeatherQuery(e.target.value)}
                placeholder="搜尋全球城市..."
                className="border-edge-subtle bg-surface-light text-ink-strong placeholder:text-ink-subtle focus:ring-accent/50 block w-full rounded-xl border py-2.5 pl-10 pr-12 text-sm transition-all outline-none focus:ring-1"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-1.5">
                {handleGeolocate && (
                  <button
                    type="button"
                    onClick={handleGeolocate}
                    disabled={geolocating || weatherLoading}
                    className="text-ink-subtle hover:bg-surface-soft hover:text-ink-strong focus-visible:outline-accent rounded-lg p-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
                    title="定位目前位置"
                  >
                    {geolocating ? (
                      <div className="border-edge-strong h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-4 h-4"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Presets Bar */}
        <div className="mb-8 flex flex-wrap gap-2">
          {WEATHER_PRESETS.map((preset) => {
            const isActive =
              weatherQuery === preset.query || weatherQuery === preset.label;
            return (
              <button
                key={preset.query}
                onClick={() => handleWeatherPreset(preset.query)}
                className={cn(
                  "theme-chip px-4 py-2.5 text-xs",
                  isActive && "theme-chip--active",
                )}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        <div role="status" aria-live="polite" className="sr-only">
          {weatherError
            ? weatherError
            : weatherLoading
              ? "正在載入天氣資料"
              : weatherData
                ? `${weatherData.location} 天氣資料已更新`
                : ""}
        </div>

        {weatherError ? (
          <div className="border-error-border bg-error-bg text-error-ink rounded-3xl border p-8 text-center">
            <p className="text-lg font-medium">{weatherError}</p>
            <p className="mt-2 text-sm opacity-70">請檢查城市名稱或網路連線</p>
            <button
              type="button"
              onClick={() => fetchWeather(weatherQuery)}
              className="theme-primary-button mx-auto mt-4 w-fit px-6"
            >
              重試
            </button>
          </div>
        ) : weatherLoading ? (
          <WeatherSkeleton />
        ) : weatherData ? (
          <div className="space-y-8 animate-in fade-in duration-500 slide-in-from-bottom-4 transition-all">
            {/* 2.1 Hero Section: Big Data Display */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Left: Main Status (Span 2) */}
              <div className="border-edge-subtle bg-surface-medium shadow-glass relative overflow-hidden rounded-3xl border p-8 lg:col-span-2">
                <div className="relative z-10 flex h-full flex-col justify-between gap-8">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-ink-strong text-3xl font-bold tracking-tight sm:text-4xl truncate">
                        {weatherData.location}
                      </h2>
                      <div className="text-ink-subtle mt-3 flex flex-wrap items-center gap-y-2 gap-x-3 text-sm">
                        <span className="leading-relaxed">
                          {weatherData.administrative.join(", ")}
                        </span>
                        {coordinatesText && (
                          <span className="bg-surface-light inline-flex rounded-full px-2.5 py-1 text-[0.7rem] font-mono whitespace-nowrap font-medium">
                            {coordinatesText}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                      <span className="text-5xl sm:text-4xl drop-shadow-sm">
                        {getWeatherDescription(
                          weatherData.weatherCode,
                        ).includes("晴")
                          ? weatherData.isDay
                            ? "☀️"
                            : "🌙"
                          : "☁️"}
                      </span>
                      <span className="text-accent mt-2 block text-sm font-bold tracking-wide whitespace-nowrap">
                        {getWeatherDescription(weatherData.weatherCode)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-end gap-6">
                    <div className="flex-1">
                      <div className="text-display text-ink-strong">
                        {Math.round(weatherData.temperature)}
                        <span className="text-ink-subtle ml-2 align-super text-3xl font-light">
                          {weatherData.temperatureUnit}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 pb-4 text-right">
                      <div className="text-ink-medium text-lg">
                        {formatLocalClock(
                          weatherData.localTime,
                          weatherData.timezone,
                          { withSeconds: false },
                        )}
                      </div>
                      <div className="text-ink-subtle text-sm">
                        {weekdayLabel ? `${weekdayLabel} · ` : ""}
                        {formatUtcOffset(weatherData.utcOffset)}
                        {weatherData.timezoneAbbreviation
                          ? ` (${weatherData.timezoneAbbreviation})`
                          : ""}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Background Decoration */}
                <div className="bg-accent/5 absolute -right-20 -top-20 h-96 w-96 rounded-full blur-3xl"></div>
              </div>

              {/* Right: Summary Cards (Span 1) */}
              <div className="grid gap-4 grid-rows-3 h-full">
                {climateHighlights.map((item) => (
                  <div
                    key={item.label}
                    className="border-edge-subtle bg-surface-light hover:bg-surface-soft shadow-glass flex items-center justify-between rounded-3xl border px-6 py-4 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{item.icon}</span>
                      <div className="flex flex-col">
                        <span className="text-ink-subtle text-sm">
                          {item.label}
                        </span>
                        <span className="text-ink-subtle text-xs">
                          {item.desc}
                        </span>
                      </div>
                    </div>
                    <span className="text-ink-strong text-xl font-bold">
                      {formatOptionalMetric(item.value, item.unit)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2.2 Metrics Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {/* Air Quality */}
              <div className="border-edge-subtle bg-surface-soft shadow-glass hover:border-edge-strong rounded-3xl border p-6 transition-colors">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-ink-subtle flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
                    <span className="text-base">🍃</span> 空氣品質
                  </h3>
                  {weatherData.airQuality && (
                    <span className="bg-success-bg text-success-ink rounded px-2 py-0.5 text-[0.65rem] font-bold">
                      良好
                    </span>
                  )}
                </div>

                {weatherData.airQuality ? (
                  <div className="flex flex-col gap-4">
                    <div>
                      <div className="text-ink-strong text-4xl font-bold">
                        {weatherData.airQuality.aqi}
                      </div>
                      <div className="text-ink-subtle mt-1 text-xs">
                        AQI 指數
                      </div>
                    </div>
                    <div className="border-edge-subtle space-y-2 border-t pt-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-ink-subtle">PM2.5</span>
                        <span className="text-ink-strong font-mono">
                          {formatOptionalMetric(
                            weatherData.airQuality.pm25,
                            weatherData.airQuality.pm25Unit,
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-ink-subtle">PM10</span>
                        <span className="text-ink-strong font-mono">
                          {formatOptionalMetric(
                            weatherData.airQuality.pm10,
                            weatherData.airQuality.pm10Unit,
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-ink-subtle flex h-24 items-center justify-center text-xs">
                    暫無資料
                  </div>
                )}
              </div>

              {/* Environment Metrics */}
              {environmentMetrics.map((item) => (
                <div
                  key={item.label}
                  className="border-edge-subtle bg-surface-soft shadow-glass hover:border-edge-strong rounded-3xl border p-6 transition-colors"
                >
                  <h3 className="text-ink-subtle mb-4 text-xs font-semibold uppercase tracking-wider">
                    {item.label}
                  </h3>
                  <div className="flex items-end justify-between">
                    <span className="text-ink-strong text-3xl font-bold">
                      {formatOptionalMetric(item.value, item.unit)}
                    </span>
                    <span className="text-2xl opacity-50 grayscale dark:grayscale-0">
                      {item.icon}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div
              className="border-edge-subtle bg-surface-soft shadow-glass relative overflow-hidden rounded-3xl border p-8 transition-all"
              aria-busy={forecastLoading}
            >
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-heading text-ink-strong">
                    溫度趨勢預報
                  </h3>
                  <p className="text-ink-subtle text-sm">
                    未來 {forecastDays} 天的高低溫變化趨勢
                  </p>
                </div>

                <div
                  role="radiogroup"
                  aria-label="預報天數"
                  className="bg-surface-light flex items-center rounded-xl p-1"
                >
                  <button
                    role="radio"
                    aria-checked={forecastDays === 7}
                    onClick={() => setForecastDays(7)}
                    disabled={forecastLoading}
                    className={cn(
                      "px-4 py-1.5 text-xs font-medium rounded-lg transition-all disabled:cursor-wait disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                      forecastDays === 7
                        ? "bg-accent/20 text-accent"
                        : "text-ink-subtle hover:text-ink-strong",
                    )}
                  >
                    7 天
                  </button>
                  <button
                    role="radio"
                    aria-checked={forecastDays === 14}
                    onClick={() => setForecastDays(14)}
                    disabled={forecastLoading}
                    className={cn(
                      "px-4 py-1.5 text-xs font-medium rounded-lg transition-all disabled:cursor-wait disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                      forecastDays === 14
                        ? "bg-accent/20 text-accent"
                        : "text-ink-subtle hover:text-ink-strong",
                    )}
                  >
                    14 天
                  </button>
                </div>
              </div>

              <div className="h-100 w-full">
                {forecastLoading ? (
                  <ChartGraphicSkeleton className="w-full" />
                ) : (
                  <WeatherChart
                    data={weatherData.dailyForecast}
                    unit={weatherData.dailyTemperatureUnit}
                  />
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="border-edge-strong text-ink-subtle flex min-h-100 flex-col items-center justify-center rounded-3xl border border-dashed p-12 text-center">
            <span className="text-4xl mb-4">🌍</span>
            <p className="text-ink-medium text-lg font-medium">
              開始探索全球氣候
            </p>
            <p className="mt-2 text-sm">
              輸入任何城市名稱，取得即時環境數據與預報
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
