import type { Metadata } from "next";
import { TemperatureStudioClient } from "./components/TemperatureStudioClient";

export const metadata: Metadata = {
  title: "溫度轉換器",
  description:
    "即時換算攝氏、華氏、Kelvin、Rankine、Réaumur 與 Newton 六種溫標，支援常用情境、洞察與歷史紀錄。",
  alternates: { canonical: "/" },
  openGraph: {
    url: "/",
    title: "溫度轉換器 | 溫度工作室",
    description: "六種溫標即時換算、常用情境與歷史紀錄。",
  },
};

export default function TemperaturePage() {
  return <TemperatureStudioClient />;
}
