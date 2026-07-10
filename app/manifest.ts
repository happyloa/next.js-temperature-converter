import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "溫度工作室",
    short_name: "溫度工作室",
    description: "多尺度溫度轉換、全球天氣與空氣品質監測工具。",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#111315",
    theme_color: "#111315",
    lang: "zh-TW",
    categories: ["utilities", "weather", "productivity"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
