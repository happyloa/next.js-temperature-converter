"use client";

import dynamic from "next/dynamic";
import { CalendarDays } from "lucide-react";

import { cn, handleRadioGroupKeyDown } from "../../lib/utils";
import type { DailyForecast } from "../../types/weather";
import { ChartGraphicSkeleton } from "../skeletons/ChartSkeleton";

const WeatherChart = dynamic(
  () => import("../WeatherChart").then((module) => module.WeatherChart),
  { loading: () => <ChartGraphicSkeleton />, ssr: false },
);

export function WeatherForecast({
  data,
  unit,
  days,
  loading,
  onDaysChange,
}: {
  data: DailyForecast[];
  unit: string;
  days: 7 | 14;
  loading: boolean;
  onDaysChange: (days: 7 | 14) => void;
}) {
  return (
    <section
      className="forecast-section"
      aria-labelledby="forecast-title"
      aria-busy={loading}
    >
      <div className="section-heading-row forecast-heading">
        <div>
          <p className="section-kicker">FORECAST</p>
          <h2 id="forecast-title" className="section-title">
            溫度趨勢
          </h2>
          <p className="field-help">未來 {days} 天的每日高低溫</p>
        </div>
        <div
          role="radiogroup"
          aria-label="預報天數"
          onKeyDown={(event) =>
            handleRadioGroupKeyDown(event, [7, 14], days, onDaysChange)
          }
          className="range-mode-control"
        >
          {[7, 14].map((option) => (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={days === option}
              data-radio-value={option}
              tabIndex={days === option ? 0 : -1}
              onClick={() => onDaysChange(option as 7 | 14)}
              disabled={loading}
              className={cn(
                "range-mode-button",
                days === option && "range-mode-button--active",
              )}
            >
              {option} 天
            </button>
          ))}
        </div>
      </div>

      <div className="forecast-mobile-list">
        {data.map((day) => (
          <div key={day.date} className="forecast-day">
            <CalendarDays className="h-4 w-4" aria-hidden />
            <span>{formatForecastDate(day.date)}</span>
            <strong>
              {Math.round(day.high)}
              {unit} / {Math.round(day.low)}
              {unit}
            </strong>
          </div>
        ))}
      </div>

      <div className="forecast-chart">
        {loading ? (
          <ChartGraphicSkeleton />
        ) : (
          <WeatherChart data={data} unit={unit} />
        )}
      </div>

      <table className="sr-only">
        <caption>未來 {days} 天每日高低溫</caption>
        <thead>
          <tr>
            <th>日期</th>
            <th>最高溫</th>
            <th>最低溫</th>
          </tr>
        </thead>
        <tbody>
          {data.map((day) => (
            <tr key={day.date}>
              <td>{formatForecastDate(day.date)}</td>
              <td>
                {day.high} {unit}
              </td>
              <td>
                {day.low} {unit}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function formatForecastDate(value: string): string {
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("zh-TW", {
    month: "numeric",
    day: "numeric",
    weekday: "short",
  }).format(new Date(year, month - 1, day));
}
