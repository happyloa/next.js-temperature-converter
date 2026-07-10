import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider";
import { AppHeader } from "./components/AppHeader";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://next-js-temperature-convert.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  manifest: "/manifest.webmanifest",
  title: {
    default: "溫度工作室 | 多尺度智慧轉換",
    template: "%s | 溫度工作室",
  },
  description:
    "支援六種溫標即時轉換、常用情境、歷史紀錄，以及全球城市天氣、空氣品質與 14 日溫度預報。",
  alternates: {
    canonical: "/",
  },

  // Open Graph 設定（分享圖由 app/opengraph-image.tsx 自動產生並帶入 metadata）
  openGraph: {
    type: "website",
    locale: "zh_TW",
    url: siteUrl,
    siteName: "溫度工作室",
    title: "溫度工作室 | 多尺度智慧轉換",
    description: "六種溫標即時轉換、全球城市天氣、空氣品質與 14 日溫度趨勢。",
  },

  // Twitter 卡片設定
  twitter: {
    card: "summary_large_image",
    title: "溫度工作室 | 多尺度智慧轉換",
    description: "六種溫標即時轉換、全球城市天氣與空氣品質資訊。",
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
    { media: "(prefers-color-scheme: light)", color: "#f5f6f5" },
    { media: "(prefers-color-scheme: dark)", color: "#111315" },
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
        <script
          dangerouslySetInnerHTML={{
            __html:
              '(function(){try{var s=localStorage.getItem("theme-preference");var t=s==="dark"||s==="light"?s:(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.setAttribute("data-theme",t);}catch(e){}})();',
          }}
        />
      </head>
      <body className="font-sans">
        <ThemeProvider>
          <a
            href="#main-content"
            className="fixed top-3 left-4 z-100 -translate-y-[150%] rounded-md bg-accent px-3 py-2 font-bold text-accent-ink focus:translate-y-0"
          >
            跳至主要內容
          </a>
          <AppHeader />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
