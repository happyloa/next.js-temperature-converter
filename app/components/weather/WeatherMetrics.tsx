import {
  Droplets,
  Gauge,
  SunMedium,
  Umbrella,
  Waves,
  Wind,
} from "lucide-react";

import { formatOptionalMetric } from "../../lib/format";
import { cn } from "../../lib/utils";
import { getEuropeanAqiLevel, getUvLevel } from "../../lib/weather";
import type { WeatherData } from "../../types/weather";

export function WeatherMetrics({ data }: { data: WeatherData }) {
  const uv = getUvLevel(data.uvIndex);
  const metrics = [
    {
      label: "相對濕度",
      value: formatOptionalMetric(data.humidity, data.humidityUnit),
      note: "目前環境",
      icon: Droplets,
    },
    {
      label: "風速",
      value: formatOptionalMetric(data.windSpeed, ` ${data.windSpeedUnit}`),
      note: "地面上 10 公尺",
      icon: Wind,
    },
    {
      label: "氣壓",
      value: formatOptionalMetric(data.pressure, ` ${data.pressureUnit}`),
      note: "地表氣壓",
      icon: Gauge,
    },
    {
      label: "過去一小時降水",
      value: formatOptionalMetric(data.precipitation, data.precipitationUnit),
      note: "雨、雪與陣雨總和",
      icon: Umbrella,
    },
  ];

  return (
    <section className="metrics-section" aria-labelledby="environment-title">
      <div className="section-heading-row">
        <div>
          <p className="section-kicker">ENVIRONMENT</p>
          <h2 id="environment-title" className="section-title">
            環境指標
          </h2>
        </div>
      </div>

      <div className="metric-grid">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="metric-tile">
              <Icon className="h-5 w-5 text-accent" aria-hidden />
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              <small>{metric.note}</small>
            </div>
          );
        })}

        <div className="metric-tile metric-tile--status">
          <SunMedium className="h-5 w-5 text-warm" aria-hidden />
          <span>紫外線指數</span>
          <strong>{formatOptionalMetric(data.uvIndex)}</strong>
          <span className={cn("status-badge", `status-badge--${uv.tone}`)}>
            {uv.label}
          </span>
          <small>{uv.guidance}</small>
        </div>

        <AirQualityMetric data={data} />
      </div>
    </section>
  );
}

function AirQualityMetric({ data }: { data: WeatherData }) {
  if (!data.airQuality) {
    return (
      <div className="metric-tile metric-tile--wide">
        <Waves className="h-5 w-5 text-accent" aria-hidden />
        <span>European AQI</span>
        <strong>--</strong>
        <small>目前沒有空氣品質資料</small>
      </div>
    );
  }

  const level = getEuropeanAqiLevel(data.airQuality.aqi);
  return (
    <div className="metric-tile metric-tile--wide">
      <Waves className="h-5 w-5 text-accent" aria-hidden />
      <span>European AQI</span>
      <strong>{data.airQuality.aqi}</strong>
      <span className={cn("status-badge", `status-badge--${level.tone}`)}>
        {level.label}
      </span>
      <div className="air-quality-details">
        <span>
          PM2.5{" "}
          <b>
            {formatOptionalMetric(
              data.airQuality.pm25,
              data.airQuality.pm25Unit,
            )}
          </b>
        </span>
        <span>
          PM10{" "}
          <b>
            {formatOptionalMetric(
              data.airQuality.pm10,
              data.airQuality.pm10Unit,
            )}
          </b>
        </span>
      </div>
      <small>{level.guidance}</small>
    </div>
  );
}
