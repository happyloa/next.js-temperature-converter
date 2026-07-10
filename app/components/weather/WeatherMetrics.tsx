import {
  Droplets,
  Gauge,
  SunMedium,
  Umbrella,
  Waves,
  Wind,
} from "lucide-react";

import { formatOptionalMetric } from "../../lib/format";
import { ui } from "../../lib/uiStyles";
import { cn } from "../../lib/utils";
import { getEuropeanAqiLevel, getUvLevel } from "../../lib/weather";
import type { WeatherLevel } from "../../lib/weather";
import type { WeatherData } from "../../types/weather";

const metricTileClass =
  "relative grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-2.5 gap-y-1.5 bg-surface-medium p-3.5";

const statusToneClass: Record<WeatherLevel["tone"], string> = {
  good: "border-accent bg-surface-soft text-accent",
  fair: "border-edge-strong bg-surface-soft text-ink-medium",
  moderate: "border-edge-strong bg-surface-soft text-ink-medium",
  poor: "border-error-border bg-error-bg text-error-ink",
  danger: "border-error-border bg-error-bg text-error-ink",
};

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
    <section
      className={cn(ui.panel, "p-4 sm:p-5")}
      aria-labelledby="environment-title"
    >
      <div className={ui.headingRow}>
        <div>
          <p className={ui.kicker}>ENVIRONMENT</p>
          <h2 id="environment-title" className={ui.sectionTitle}>
            環境指標
          </h2>
        </div>
      </div>

      <div className="mt-3.5 grid min-w-0 grid-cols-1 gap-px overflow-hidden rounded-lg border border-edge-subtle bg-edge-subtle sm:grid-cols-2 min-[900px]:grid-cols-3">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className={metricTileClass}>
              <Icon className="h-5 w-5 text-accent" aria-hidden />
              <span className="text-xs text-ink-medium">{metric.label}</span>
              <strong className="text-right text-lg text-ink-strong [font-variant-numeric:tabular-nums] [overflow-wrap:anywhere]">
                {metric.value}
              </strong>
              <small className="col-start-2 col-end-[-1] text-[0.6875rem] text-ink-subtle">
                {metric.note}
              </small>
            </div>
          );
        })}

        <div className={metricTileClass}>
          <SunMedium className="h-5 w-5 text-accent" aria-hidden />
          <span className="text-xs text-ink-medium">紫外線指數</span>
          <strong className="text-right text-lg text-ink-strong [font-variant-numeric:tabular-nums]">
            {formatOptionalMetric(data.uvIndex)}
          </strong>
          <span
            className={cn(
              "col-start-3 row-start-2 justify-self-end rounded-full border px-2 py-0.5 text-[0.6875rem] font-[750]",
              statusToneClass[uv.tone],
            )}
          >
            {uv.label}
          </span>
          <small className="col-start-2 col-end-3 row-start-2 text-[0.6875rem] text-ink-subtle">
            {uv.guidance}
          </small>
        </div>

        <AirQualityMetric data={data} />
      </div>
    </section>
  );
}

function AirQualityMetric({ data }: { data: WeatherData }) {
  if (!data.airQuality) {
    return (
      <div className={cn(metricTileClass, "min-[900px]:col-span-2")}>
        <Waves className="h-5 w-5 text-accent" aria-hidden />
        <span className="text-xs text-ink-medium">European AQI</span>
        <strong className="text-right text-lg text-ink-strong">--</strong>
        <small className="col-start-2 col-end-[-1] text-[0.6875rem] text-ink-subtle">
          目前沒有空氣品質資料
        </small>
      </div>
    );
  }

  const level = getEuropeanAqiLevel(data.airQuality.aqi);
  return (
    <div className={cn(metricTileClass, "min-[900px]:col-span-2")}>
      <Waves className="h-5 w-5 text-accent" aria-hidden />
      <span className="text-xs text-ink-medium">European AQI</span>
      <strong className="text-right text-lg text-ink-strong [font-variant-numeric:tabular-nums]">
        {data.airQuality.aqi}
      </strong>
      <span
        className={cn(
          "col-start-3 row-start-2 justify-self-end rounded-full border px-2 py-0.5 text-[0.6875rem] font-[750]",
          statusToneClass[level.tone],
        )}
      >
        {level.label}
      </span>
      <div className="col-start-2 col-end-3 row-start-2 flex flex-wrap gap-x-4 gap-y-2 text-[0.6875rem] text-ink-subtle [&_b]:text-ink-strong">
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
      <small className="col-start-2 col-end-[-1] row-start-3 text-[0.6875rem] text-ink-subtle">
        {level.guidance}
      </small>
    </div>
  );
}
