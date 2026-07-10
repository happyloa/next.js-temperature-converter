"use client";

import { AlertCircle, RefreshCw } from "lucide-react";

import { useWeatherDashboard } from "../../hooks/useWeatherDashboard";
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
    <main id="main-content" className="page-shell">
      <div className="weather-workspace">
        <header className="weather-page-header">
          <div>
            <p className="section-kicker">GLOBAL WEATHER</p>
            <h1 className="page-title">城市天氣與環境</h1>
            <p className="page-description">
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
          <div className="error-banner" role="alert">
            <AlertCircle className="h-5 w-5 shrink-0" aria-hidden />
            <div>
              <strong>{weatherError}</strong>
              {weatherData ? <p>目前仍保留上一次成功取得的資料。</p> : null}
            </div>
            <button
              type="button"
              onClick={() => void fetchWeather(weatherQuery, forecastDays)}
              className="secondary-button"
            >
              <RefreshCw className="h-4 w-4" aria-hidden />
              重試
            </button>
          </div>
        ) : null}

        {weatherLoading && !weatherData ? (
          <WeatherSkeleton />
        ) : weatherData ? (
          <div className="weather-content">
            <CurrentConditions data={weatherData} />
            <WeatherMetrics data={weatherData} />
            <WeatherForecast
              data={weatherData.dailyForecast}
              unit={weatherData.dailyTemperatureUnit}
              days={forecastDays}
              loading={forecastLoading}
              onDaysChange={setForecastDays}
            />
          </div>
        ) : (
          <div className="empty-state weather-empty-state">
            輸入城市名稱或使用目前位置，開始查看環境資料。
          </div>
        )}

        <footer className="data-attribution">
          <span>Weather data by </span>
          <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">
            Open-Meteo
          </a>
          <span> · Air quality data by CAMS ENSEMBLE</span>
        </footer>
      </div>
    </main>
  );
}
