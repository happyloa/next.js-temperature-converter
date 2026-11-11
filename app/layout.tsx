import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider";
import { AppHeader } from "./components/AppHeader";
import { AppFooter } from "./components/AppFooter";
import { SITE_URL } from "./lib/site";
import { THEME_INIT_SCRIPT } from "./lib/theme";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  manifest: "/manifest.webmanifest",
  title: {
    default: "溫度工作室 | 溫標換算與城市天氣",
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
    url: SITE_URL,
    siteName: "溫度工作室",
    title: "溫度工作室 | 溫標換算與城市天氣",
    description: "六種溫標即時轉換、全球城市天氣、空氣品質與 14 日溫度趨勢。",
  },

  // Twitter 卡片設定
  twitter: {
    card: "summary_large_image",
    title: "溫度工作室 | 溫標換算與城市天氣",
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
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#111111" },
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
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="font-sans">
        <ThemeProvider>
          <a
            href="#main-content"
            className="fixed top-3 left-4 z-100 translate-y-[-150%] bg-accent px-3 py-2 font-bold text-accent-ink focus:translate-y-0"
          >
            跳至主要內容
          </a>
          <AppHeader />
          {children}
          <AppFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
