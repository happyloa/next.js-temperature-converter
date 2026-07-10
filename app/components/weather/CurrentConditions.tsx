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

export function CurrentConditions({ data }: { data: WeatherData }) {
  const coordinates = data.coordinates
    ? `${Math.abs(data.coordinates.latitude).toFixed(4)}°${data.coordinates.latitude >= 0 ? "N" : "S"} · ${Math.abs(data.coordinates.longitude).toFixed(4)}°${data.coordinates.longitude >= 0 ? "E" : "W"}`
    : null;
  const weekday =
    data.dayOfWeek === null ? null : (WEEKDAYS[data.dayOfWeek] ?? null);

  return (
    <section
      className={cn(
        ui.panel,
        "grid min-w-0 gap-5 border-l-4 border-l-accent p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:p-5",
      )}
      aria-labelledby="current-location"
    >
      <div className="min-w-0 sm:col-start-1">
        <p className={ui.kicker}>CURRENT CONDITIONS</p>
        <h2
          id="current-location"
          className="mt-1.5 min-w-0 text-2xl font-[760] leading-tight text-ink-strong [overflow-wrap:anywhere] sm:text-4xl"
        >
          {data.location}
        </h2>
        <div className="mt-2.5 flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs text-ink-subtle">
          <MapPin className="h-4 w-4 shrink-0" aria-hidden />
          <span className="[overflow-wrap:anywhere]">
            {data.administrative.join(" · ") || "座標定位"}
          </span>
          {coordinates ? (
            <code className="max-w-full rounded-md bg-surface-soft px-1.5 py-1 text-[0.6875rem] [overflow-wrap:anywhere]">
              {coordinates}
            </code>
          ) : null}
        </div>
      </div>

      <div className="flex min-w-0 items-center gap-3 sm:col-start-2 sm:row-start-1">
        <WeatherIcon
          code={data.weatherCode}
          isDay={data.isDay}
          className="h-11 w-11 shrink-0 text-accent"
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
        <strong className="text-[3.5rem] leading-none text-ink-strong [font-variant-numeric:tabular-nums] sm:text-[5.25rem]">
          {Math.round(data.temperature)}
        </strong>
        <span className="text-2xl text-ink-subtle">{data.temperatureUnit}</span>
        <small className="w-full text-xs text-ink-medium">
          高 {formatOptionalMetric(data.dailyHigh, data.dailyTemperatureUnit)} ·
          低 {formatOptionalMetric(data.dailyLow, data.dailyTemperatureUnit)}
        </small>
      </div>

      <div className="flex min-w-0 items-center gap-2.5 text-ink-subtle sm:col-start-2 sm:row-start-2 sm:self-end sm:justify-self-end sm:text-right">
        <Clock3 className="h-4 w-4" aria-hidden />
        <div className="flex min-w-0 flex-col">
          <strong className="text-sm text-ink-strong">
            {formatLocalClock(data.localTime, data.timezone, {
              withSeconds: false,
            })}
          </strong>
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
