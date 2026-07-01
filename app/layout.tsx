import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider";
import { ThemeToggleButton } from "./components/ThemeToggleButton";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://next-js-temperature-convert.vercel.app";

export const metadata: Metadata = {
  manifest: "/manifest.webmanifest",
  title: {
    default: "溫度工作室 | 多尺度智慧轉換",
    template: "%s | 溫度工作室",
  },
  description:
    "現代化的溫度轉換工作室，支援攝氏、華氏、絕對溫標與進階單位並提供情境洞察與歷史紀錄。即時天氣資訊與 7 日預報，讓溫度轉換更具情境背景。",

  // Open Graph 設定
  openGraph: {
    type: "website",
    locale: "zh_TW",
    url: siteUrl,
    siteName: "溫度工作室",
    title: "溫度工作室 | 多尺度智慧轉換",
    description:
      "支援六種溫標即時轉換、全球天氣資訊、7 日趨勢圖表與環境儀表板。支援語音輸入，快捷鍵操作。",
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "溫度工作室 - Temperature Studio",
      },
    ],
  },

  // Twitter 卡片設定
  twitter: {
    card: "summary_large_image",
    title: "溫度工作室 | 多尺度智慧轉換",
    description: "六種溫標即時轉換、全球天氣資訊與環境儀表板。支援語音輸入。",
    images: [`${siteUrl}/og-image.png`],
    creator: "@TemperatureStudio",
  },

  // 基礎 SEO 設定
  applicationName: "溫度工作室",
  authors: [{ name: "Temperature Studio" }],
  creator: "Temperature Studio",
  publisher: "Temperature Studio",

  // 搜尋引擎爬蟲設定
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // 網站驗證 (例如 Search Console)
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
  },

  // 其他設定
  formatDetection: {
    telephone: false,
  },
  category: "utilities",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <head>
        <link rel="canonical" href={siteUrl} />
        <script
          dangerouslySetInnerHTML={{
            __html:
              '(function(){try{var s=localStorage.getItem("theme-preference");var t=s==="dark"||s==="light"?s:(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.setAttribute("data-theme",t);}catch(e){}})();',
          }}
        />
      </head>
      <body className="font-sans">
        <ThemeProvider>
          {children}
          <ThemeToggleButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
