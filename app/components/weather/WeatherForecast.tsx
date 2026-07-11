"use client";

import dynamic from "next/dynamic";
import { CalendarDays } from "lucide-react";

import { ui } from "../../lib/uiStyles";
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
      className={cn(ui.panel, "p-4 sm:p-5")}
      aria-labelledby="forecast-title"
      aria-busy={loading}
    >
      <div
        className={cn(
          ui.headingRow,
          "items-start max-[760px]:flex-col max-[760px]:gap-3",
        )}
      >
        <div>
          <p className={ui.kicker}>FORECAST</p>
          <h2 id="forecast-title" className={ui.sectionTitle}>
            溫度趨勢
          </h2>
          <p className={ui.fieldHelp}>未來 {days} 天的每日高低溫</p>
        </div>
        <div
          role="radiogroup"
          aria-label="預報天數"
          onKeyDown={(event) =>
            handleRadioGroupKeyDown(event, [7, 14], days, onDaysChange)
          }
          className={ui.rangeControl}
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
                ui.rangeButton,
                days === option ? ui.rangeButtonActive : "text-ink-subtle",
              )}
            >
              {option} 天
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3.5 grid gap-px overflow-hidden rounded-lg border border-edge-subtle bg-edge-subtle md:hidden">
        {data.map((day) => (
          <div
            key={day.date}
            className="grid grid-cols-[1.25rem_minmax(0,1fr)_auto] items-center gap-2.5 bg-surface-medium p-3 text-xs text-ink-medium"
          >
            <CalendarDays className="h-4 w-4" aria-hidden />
            <span>{formatForecastDate(day.date)}</span>
            <strong className="text-ink-strong [font-variant-numeric:tabular-nums]">
              {Math.round(day.high)}
              {unit} / {Math.round(day.low)}
              {unit}
            </strong>
          </div>
        ))}
      </div>

      <div className="mt-4 hidden h-96 md:block">
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
