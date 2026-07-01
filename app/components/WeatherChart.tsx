"use client";
import { useEffect, useState } from "react";
import type { FC } from "react";
import {
  ResponsiveContainer,
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
  grid: "#334155",
  axisText: "#94a3b8",
  axisLine: "#475569",
  tooltipBg: "#1e293b",
  tooltipBorder: "#334155",
  high: "#ef4444",
  low: "#3b82f6",
};

const readChartColors = (): ChartColors => {
  const styles = getComputedStyle(document.documentElement);
  const read = (name: string, fallback: string) =>
    styles.getPropertyValue(name).trim() || fallback;

  return {
    grid: read("--border-subtle", FALLBACK_COLORS.grid),
    axisText: read("--text-subtle", FALLBACK_COLORS.axisText),
    axisLine: read("--border-strong", FALLBACK_COLORS.axisLine),
    tooltipBg: read("--surface-strong", FALLBACK_COLORS.tooltipBg),
    tooltipBorder: read("--border-subtle", FALLBACK_COLORS.tooltipBorder),
    high: "#ef4444",
    low: read("--button-primary-bg", FALLBACK_COLORS.low),
  };
};

/**
 * Weather trend chart showing 7-day temperature forecast.
 */
export const WeatherChart: FC<WeatherChartProps> = ({ data, unit = "°C" }) => {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const [colors, setColors] = useState<ChartColors>(FALLBACK_COLORS);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    setColors(readChartColors());
  }, [mounted, theme]);

  if (!mounted || data.length === 0) {
    return (
      <div className="border-edge-subtle bg-surface-light text-ink-subtle flex h-full min-h-64 items-center justify-center rounded-2xl border border-dashed text-sm">
        {!mounted ? "載入圖表..." : "暫無預報資料"}
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const weekday = date.toLocaleDateString("zh-TW", { weekday: "short" });
    return `${date.getMonth() + 1}/${date.getDate()}(${weekday.replace("週", "")})`;
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <h4 className="shrink-0 text-sm font-medium text-slate-300">
        {data.length} 日溫度趨勢
      </h4>
      <div className="min-h-0 flex-1 w-full">
        <ResponsiveContainer
          width="100%"
          height="100%"
          minWidth={0}
          minHeight={0}
        >
          <LineChart
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
                borderRadius: "12px",
                fontSize: "12px",
              }}
              labelFormatter={(label) => {
                const date = new Date(label);
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
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-center gap-6 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
          最高溫
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
          最低溫
        </span>
      </div>
    </div>
  );
};
