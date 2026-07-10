"use client";

import { AlertCircle, RefreshCw } from "lucide-react";

import { useWeatherDashboard } from "../../hooks/useWeatherDashboard";
import { ui } from "../../lib/uiStyles";
import { cn } from "../../lib/utils";
import { WeatherSkeleton } from "../skeletons/WeatherSkeleton";
import { CurrentConditions } from "./CurrentConditions";
import { WeatherForecast } from "./WeatherForecast";
import { WeatherMetrics } from "./WeatherMetrics";
import { WeatherSearch } from "./WeatherSearch";

export function WeatherDashboard({ defaultQuery }: { defaultQuery: string }) {
  const {
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
    setForecastDays,
    suggestions,
    suggestionsLoading,
    suggestionsOpen,
    setSuggestionsOpen,
  } = useWeatherDashboard(defaultQuery);

  return (
    <main id="main-content" className={ui.pageShell}>
      <div className={ui.workspace}>
        <header className="mb-5 grid gap-5 min-[900px]:grid-cols-[minmax(18rem,0.8fr)_minmax(28rem,1.2fr)] min-[900px]:items-start">
          <div>
            <p className={ui.kicker}>GLOBAL WEATHER</p>
            <h1 className={ui.pageTitle}>城市天氣與環境</h1>
            <p className={ui.description}>
              查詢即時天氣、空氣品質、紫外線與未來溫度趨勢。
            </p>
          </div>
          <WeatherSearch
            query={weatherQuery}
            onQueryChange={handleWeatherQueryChange}
            onSubmit={handleWeatherSubmit}
            onPreset={handleWeatherPreset}
            onGeolocate={handleGeolocate}
            geolocating={geolocating}
            loading={weatherLoading}
            suggestions={suggestions}
            suggestionsLoading={suggestionsLoading}
            suggestionsOpen={suggestionsOpen}
            setSuggestionsOpen={setSuggestionsOpen}
            onSuggestionSelect={handleSuggestionSelect}
          />
        </header>

        <div className="sr-only" role="status" aria-live="polite">
          {weatherLoading
            ? "正在載入天氣資料"
            : weatherData
              ? `${weatherData.location} 天氣資料已更新`
              : ""}
        </div>

        {weatherError ? (
          <div
            className="mb-4 flex items-center gap-3 rounded-lg border border-error-border bg-error-bg p-3 text-error-ink max-[760px]:flex-col max-[760px]:items-stretch"
            role="alert"
          >
            <AlertCircle className="h-5 w-5 shrink-0" aria-hidden />
            <div className="min-w-0 flex-1 text-[0.8125rem]">
              <strong>{weatherError}</strong>
              {weatherData ? (
                <p className="text-xs opacity-80">
                  目前仍保留上一次成功取得的資料。
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => void fetchWeather(weatherQuery, forecastDays)}
              className={cn(
                ui.button,
                ui.secondaryButton,
                "max-[760px]:self-start",
              )}
            >
              <RefreshCw className="h-4 w-4" aria-hidden />
              重試
            </button>
          </div>
        ) : null}

        {weatherLoading && !weatherData ? (
          <WeatherSkeleton />
        ) : weatherData ? (
          <div className="flex min-w-0 flex-col gap-5">
            <CurrentConditions data={weatherData} />
            <WeatherMetrics data={weatherData} />
            <WeatherForecast
              data={weatherData.dailyForecast}
              unit={weatherData.dailyTemperatureUnit}
              days={forecastDays}
              loading={forecastLoading || weatherLoading}
              onDaysChange={setForecastDays}
            />
          </div>
        ) : (
          <div
            className={cn(ui.emptyState, "grid min-h-64 place-items-center")}
          >
            輸入城市名稱或使用目前位置，開始查看環境資料。
          </div>
        )}

        <footer className="mt-5 text-center text-[0.6875rem] text-ink-subtle">
          <span>Weather data by </span>
          <a
            href="https://open-meteo.com/"
            target="_blank"
            rel="noreferrer"
            className="text-accent underline underline-offset-2"
          >
            Open-Meteo
          </a>
          <span> · Air quality data by CAMS ENSEMBLE</span>
        </footer>
      </div>
    </main>
  );
}
