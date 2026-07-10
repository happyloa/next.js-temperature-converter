"use client";
import type { FC } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { DailyForecast } from "../types/weather";
import { useTheme } from "./ThemeProvider";

interface WeatherChartProps {
  data: DailyForecast[];
  unit?: string;
}

type ChartColors = {
  grid: string;
  axisText: string;
  axisLine: string;
  tooltipBg: string;
  tooltipBorder: string;
  high: string;
  low: string;
};

const FALLBACK_COLORS: ChartColors = {
  grid: "#343b38",
  axisText: "#8f9894",
  axisLine: "#5d6864",
  tooltipBg: "#191c1b",
  tooltipBorder: "#343b38",
  high: "#c3c8c6",
  low: "#58b8ad",
};

const readChartColors = (): ChartColors => {
  const styles = getComputedStyle(document.documentElement);
  const read = (name: string, fallback: string) =>
    styles.getPropertyValue(name).trim() || fallback;

  return {
    grid: read("--edge-subtle", FALLBACK_COLORS.grid),
    axisText: read("--ink-subtle", FALLBACK_COLORS.axisText),
    axisLine: read("--edge-strong", FALLBACK_COLORS.axisLine),
    tooltipBg: read("--surface-strong", FALLBACK_COLORS.tooltipBg),
    tooltipBorder: read("--edge-subtle", FALLBACK_COLORS.tooltipBorder),
    high: read("--ink-medium", FALLBACK_COLORS.high),
    low: read("--accent", FALLBACK_COLORS.low),
  };
};

/**
 * Weather trend chart showing 7-day temperature forecast.
 */
export const WeatherChart: FC<WeatherChartProps> = ({ data, unit = "°C" }) => {
  const { theme } = useTheme();
  const colors = readChartColors();

  if (data.length === 0) {
    return (
      <div className="flex h-full min-h-64 items-center justify-center rounded-lg border border-dashed border-edge-subtle bg-surface-light text-sm text-ink-subtle">
        暫無預報資料
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    const weekday = date.toLocaleDateString("zh-TW", { weekday: "short" });
    return `${date.getMonth() + 1}/${date.getDate()}(${weekday.replace("週", "")})`;
  };

  return (
    <div
      className="flex h-full min-h-0 flex-col gap-3"
      role="img"
      aria-label={`${data.length} 日最高溫與最低溫折線圖`}
      data-chart-theme={theme}
    >
      <h4 className="shrink-0 text-sm font-medium text-ink-medium">
        {data.length} 日溫度趨勢
      </h4>
      <div className="min-h-0 flex-1 w-full">
        <LineChart
          responsive
          style={{ width: "100%", height: "100%" }}
          data={data}
          margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={colors.grid}
            opacity={0.5}
          />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fill: colors.axisText, fontSize: 11 }}
            axisLine={{ stroke: colors.axisLine }}
            tickLine={{ stroke: colors.axisLine }}
          />
          <YAxis
            tick={{ fill: colors.axisText, fontSize: 11 }}
            axisLine={{ stroke: colors.axisLine }}
            tickLine={{ stroke: colors.axisLine }}
            tickFormatter={(value) => `${value}${unit}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: colors.tooltipBg,
              border: `1px solid ${colors.tooltipBorder}`,
              borderRadius: "8px",
              fontSize: "12px",
            }}
            labelFormatter={(label) => {
              const [year, month, day] = `${label}`.split("-").map(Number);
              const date = new Date(year, month - 1, day);
              return date.toLocaleDateString("zh-TW", {
                month: "short",
                day: "numeric",
                weekday: "short",
              });
            }}
            formatter={(value, name) => {
              const numValue = typeof value === "number" ? value : 0;
              return [
                `${numValue.toFixed(1)}${unit}`,
                name === "high" ? "最高" : "最低",
              ];
            }}
          />
          <Line
            type="monotone"
            dataKey="high"
            stroke={colors.high}
            strokeWidth={2}
            dot={{ fill: colors.high, strokeWidth: 0, r: 3 }}
            activeDot={{
              r: 5,
              stroke: colors.high,
              strokeWidth: 2,
              fill: colors.tooltipBg,
            }}
            name="high"
          />
          <Line
            type="monotone"
            dataKey="low"
            stroke={colors.low}
            strokeWidth={2}
            dot={{ fill: colors.low, strokeWidth: 0, r: 3 }}
            activeDot={{
              r: 5,
              stroke: colors.low,
              strokeWidth: 2,
              fill: colors.tooltipBg,
            }}
            name="low"
          />
        </LineChart>
      </div>
      <div className="flex items-center justify-center gap-6 text-xs text-ink-subtle">
        <span className="flex items-center gap-1">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: colors.high }}
          />
          最高溫
        </span>
        <span className="flex items-center gap-1">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: colors.low }}
          />
          最低溫
        </span>
      </div>
    </div>
  );
};
