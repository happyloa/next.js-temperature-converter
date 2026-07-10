import type { Metadata } from "next";
import { WeatherDashboard } from "../components/weather/WeatherDashboard";

export const metadata: Metadata = {
  title: "全球城市天氣",
  description:
    "搜尋全球城市的即時天氣、European AQI、PM2.5、紫外線與 7 至 14 日溫度預報。",
  alternates: { canonical: "/weather" },
  openGraph: {
    url: "/weather",
    title: "全球城市天氣 | 溫度工作室",
    description: "即時天氣、空氣品質、紫外線與 14 日溫度預報。",
  },
};

export default function WeatherPage() {
  return <WeatherDashboard defaultQuery="Taipei" />;
}
