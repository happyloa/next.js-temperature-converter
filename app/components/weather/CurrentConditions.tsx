import { Clock3, MapPin } from "lucide-react";

import {
  formatLocalClock,
  formatOptionalMetric,
  formatUtcOffset,
} from "../../lib/format";
import { ui } from "../../lib/uiStyles";
import { cn } from "../../lib/utils";
import { getWeatherDescription } from "../../lib/weather";
import type { WeatherData } from "../../types/weather";
import { WeatherIcon } from "./WeatherIcon";

const WEEKDAYS = ["週日", "週一", "週二", "週三", "週四", "週五", "週六"];

export function CurrentConditions({
  data,
  stale = false,
}: {
  data: WeatherData;
  stale?: boolean;
}) {
  const coordinates = data.coordinates
    ? `${Math.abs(data.coordinates.latitude).toFixed(2)}°${data.coordinates.latitude >= 0 ? "N" : "S"} · ${Math.abs(data.coordinates.longitude).toFixed(2)}°${data.coordinates.longitude >= 0 ? "E" : "W"}`
    : null;
  const weekday =
    data.dayOfWeek === null ? null : (WEEKDAYS[data.dayOfWeek] ?? null);

  return (
    <section
      className={cn(
        ui.panel,
        "grid min-w-0 gap-6 border-t-2 border-t-accent-label p-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:p-8",
      )}
      aria-labelledby="current-location"
    >
      <div className="min-w-0 sm:col-start-1">
        <h2
          id="current-location"
          className="min-w-0 text-2xl font-bold leading-tight tracking-tight text-ink-strong [overflow-wrap:anywhere] sm:text-4xl"
        >
          {data.location}
        </h2>
        <div className="mt-2.5 flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs text-ink-subtle">
          <MapPin className="h-4 w-4 shrink-0" aria-hidden />
          <span className="[overflow-wrap:anywhere]">
            {data.administrative.join(" · ") || "座標定位"}
          </span>
          {coordinates ? (
            <code className="max-w-full bg-surface-soft px-1.5 py-1 text-[0.6875rem] [overflow-wrap:anywhere]">
              {coordinates}
            </code>
          ) : null}
        </div>
      </div>

      <div className="flex min-w-0 items-center gap-3 sm:col-start-2 sm:row-start-1">
        <WeatherIcon
          code={data.weatherCode}
          isDay={data.isDay}
          className="size-14 shrink-0 text-accent-label"
        />
        <div className="flex min-w-0 flex-col">
          <strong className="text-sm text-ink-strong">
            {getWeatherDescription(data.weatherCode)}
          </strong>
          <span className="text-xs text-ink-subtle [overflow-wrap:anywhere]">
            體感{" "}
            {formatOptionalMetric(
              data.apparentTemperature,
              data.apparentTemperatureUnit,
            )}
          </span>
        </div>
      </div>

      <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1 sm:col-start-1 sm:row-start-2">
        <strong className="text-[6rem] font-normal leading-none tracking-[-0.07em] text-ink-strong sm:text-[8.5rem]">
          {Math.round(data.temperature)}
        </strong>
        <span className="text-4xl text-accent-label sm:text-5xl">
          {data.temperatureUnit}
        </span>
        <small className="w-full text-xs text-ink-medium">
          高 {formatOptionalMetric(data.dailyHigh, data.dailyTemperatureUnit)} ·
          低 {formatOptionalMetric(data.dailyLow, data.dailyTemperatureUnit)}
        </small>
      </div>

      <div className="flex min-w-0 items-center gap-2.5 text-ink-subtle sm:col-start-2 sm:row-start-2 sm:self-end sm:justify-self-end sm:text-right">
        <Clock3 className="h-4 w-4" aria-hidden />
        <div className="flex min-w-0 flex-col">
          <strong className="text-sm text-ink-strong">
            {stale ? "資料可能已過期" : "資料已更新"}
          </strong>
          <span className="text-xs text-ink-subtle [overflow-wrap:anywhere]">
            更新於{" "}
            {formatLocalClock(data.fetchedAt, data.timezone, {
              withSeconds: false,
            })}
          </span>
          <span className="text-xs text-ink-subtle [overflow-wrap:anywhere]">
            {weekday ? `${weekday} · ` : ""}
            {formatUtcOffset(data.utcOffset)}
            {data.timezoneAbbreviation ? ` (${data.timezoneAbbreviation})` : ""}
          </span>
        </div>
      </div>
    </section>
  );
}
