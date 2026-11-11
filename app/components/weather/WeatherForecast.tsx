"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";

import { parseLocalDate } from "../../lib/format";
import { ui } from "../../lib/uiStyles";
import { cn } from "../../lib/utils";
import type { DailyForecast } from "../../types/weather";
import { SegmentedControl } from "../SegmentedControl";
import { ChartGraphicSkeleton } from "../skeletons/ChartSkeleton";

const WeatherChart = dynamic(
  () => import("../WeatherChart").then((module) => module.WeatherChart),
  {
    loading: () => <ChartGraphicSkeleton className="h-full min-h-0" />,
    ssr: false,
  },
);

const DESKTOP_CHART_QUERY = "(min-width: 768px)";
const FORECAST_DAY_OPTIONS = [
  { value: 7, label: "7 天" },
  { value: 14, label: "14 天" },
] as const;
const forecastDateFormatter = new Intl.DateTimeFormat("zh-TW", {
  month: "numeric",
  day: "numeric",
  weekday: "short",
});

function useDesktopChart() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_CHART_QUERY);
    const updateMatch = () => setIsDesktop(mediaQuery.matches);

    updateMatch();
    mediaQuery.addEventListener("change", updateMatch);
    return () => mediaQuery.removeEventListener("change", updateMatch);
  }, []);

  return isDesktop;
}

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
  const isDesktopChart = useDesktopChart();

  return (
    <section
      className={cn(ui.panel, "p-5 sm:p-6")}
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
          <h2 id="forecast-title" className={ui.sectionTitle}>
            溫度趨勢
          </h2>
          <p className={ui.fieldHelp}>未來 {days} 天的每日高低溫</p>
        </div>
        <SegmentedControl
          label="預報天數"
          options={FORECAST_DAY_OPTIONS}
          value={days}
          onChange={onDaysChange}
          disabled={loading}
        />
      </div>

      <div className="mt-3.5 grid gap-px overflow-hidden border border-edge-subtle bg-edge-subtle md:hidden">
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
        {loading || !isDesktopChart ? (
          <ChartGraphicSkeleton className="h-full min-h-0" />
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
  return forecastDateFormatter.format(parseLocalDate(value));
}
