import { Clock3, MapPin } from "lucide-react";

import {
  formatLocalClock,
  formatOptionalMetric,
  formatUtcOffset,
} from "../../lib/format";
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
    <section className="current-conditions" aria-labelledby="current-location">
      <div className="current-location-block">
        <p className="section-kicker">CURRENT CONDITIONS</p>
        <h2 id="current-location" className="current-location">
          {data.location}
        </h2>
        <div className="location-meta">
          <MapPin className="h-4 w-4 shrink-0" aria-hidden />
          <span>{data.administrative.join(" · ") || "座標定位"}</span>
          {coordinates ? <code>{coordinates}</code> : null}
        </div>
      </div>

      <div className="current-weather-summary">
        <WeatherIcon
          code={data.weatherCode}
          isDay={data.isDay}
          className="current-weather-icon"
        />
        <div>
          <strong>{getWeatherDescription(data.weatherCode)}</strong>
          <span>
            體感{" "}
            {formatOptionalMetric(
              data.apparentTemperature,
              data.apparentTemperatureUnit,
            )}
          </span>
        </div>
      </div>

      <div className="current-temperature">
        <strong>{Math.round(data.temperature)}</strong>
        <span>{data.temperatureUnit}</span>
        <small>
          高 {formatOptionalMetric(data.dailyHigh, data.dailyTemperatureUnit)} ·
          低 {formatOptionalMetric(data.dailyLow, data.dailyTemperatureUnit)}
        </small>
      </div>

      <div className="local-time-block">
        <Clock3 className="h-4 w-4" aria-hidden />
        <div>
          <strong>
            {formatLocalClock(data.localTime, data.timezone, {
              withSeconds: false,
            })}
          </strong>
          <span>
            {weekday ? `${weekday} · ` : ""}
            {formatUtcOffset(data.utcOffset)}
            {data.timezoneAbbreviation ? ` (${data.timezoneAbbreviation})` : ""}
          </span>
        </div>
      </div>
    </section>
  );
}
