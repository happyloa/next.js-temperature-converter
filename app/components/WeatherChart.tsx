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

interface WeatherChartProps {
  data: DailyForecast[];
  unit?: string;
}

/**
 * Weather trend chart showing 7-day temperature forecast.
 */
export const WeatherChart: FC<WeatherChartProps> = ({ data, unit = "°C" }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted || data.length === 0) {
    return (
      <div className="flex h-full min-h-64 items-center justify-center rounded-2xl border border-dashed border-slate-700/40 bg-slate-900/40 text-sm text-slate-400">
        {!mounted ? "載入圖表..." : "暫無預報資料"}
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
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
              stroke="#334155"
              opacity={0.5}
            />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              axisLine={{ stroke: "#475569" }}
              tickLine={{ stroke: "#475569" }}
            />
            <YAxis
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              axisLine={{ stroke: "#475569" }}
              tickLine={{ stroke: "#475569" }}
              tickFormatter={(value) => `${value}${unit}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
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
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ fill: "#ef4444", strokeWidth: 0, r: 3 }}
              activeDot={{
                r: 5,
                stroke: "#ef4444",
                strokeWidth: 2,
                fill: "#1e293b",
              }}
              name="high"
            />
            <Line
              type="monotone"
              dataKey="low"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: "#3b82f6", strokeWidth: 0, r: 3 }}
              activeDot={{
                r: 5,
                stroke: "#3b82f6",
                strokeWidth: 2,
                fill: "#1e293b",
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
