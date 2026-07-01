# Temperature Studio - 溫度工作室

基於 Next.js 16 App Router 打造的溫度轉換與全球天氣儀表板。專案支援多種溫標即時換算、轉換紀錄、分享/匯出、深淺色主題，以及使用 Open-Meteo 的城市天氣、空氣品質與 7/14 日溫度趨勢圖表。

線上 Demo：[https://next-js-temperature-convert.vercel.app/](https://next-js-temperature-convert.vercel.app/)

## 核心功能

### 溫度轉換

- 支援攝氏、華氏、絕對溫標、蘭氏、列氏與牛頓氏。
- 數值輸入與滑桿雙向連動，所有溫標即時更新。
- 提供常用情境預設值，例如冰點、體溫、咖啡沖泡與太陽表面溫度。
- 自動產生情境洞察，例如距離冰點/沸點的差距與溫度感受提示。
- 最近 8 筆轉換紀錄會存到瀏覽器儲存空間，並具備 localStorage/sessionStorage fallback。

### 城市天氣

- 使用 Open-Meteo Geocoding API 搜尋城市。
- 使用 Open-Meteo Forecast API 顯示即時溫度、體感溫度、濕度、風速、氣壓、降雨量與 UV 指數。
- 使用 Open-Meteo Air Quality API 顯示 AQI、PM2.5、PM10。
- 支援瀏覽器 Geolocation，允許後可用目前位置反查城市。
- 提供 7 天與 14 天預報切換，並以 Recharts 顯示高低溫趨勢。
- 圖表切換資料時會以固定高度 skeleton loading 取代舊圖表，避免畫面糊疊或高度跳動。

### 使用者體驗

- 全站共用導覽列（`AppHeader`），轉換器與天氣頁之間可直接切換。
- 全站字體使用 Google Fonts「思源黑體」（Noto Sans TC），透過 `next/font/google` 自動子集化與快取，不依賴使用者系統是否安裝該字體。
- 支援深色/淺色主題並記住偏好，且以 blocking inline script 避免重新整理時的主題閃爍。
- 支援 Web Share API，瀏覽器不支援時會 fallback 到剪貼簿。
- 支援 CSV/JSON 匯出。
- 具備 SEO metadata、robots、sitemap 與 Web App Manifest。
- 具備自訂錯誤畫面（`app/error.tsx`），路由內未預期的例外會顯示符合品牌風格的錯誤頁並提供重試/返回首頁，而非瀏覽器預設畫面。

## 技術棧

- Framework：Next.js 16 App Router
- Language：TypeScript 6
- UI：React 19
- Styling：Tailwind CSS 4
- Chart：Recharts
- Quality：Prettier
- Weather API：Open-Meteo

## 專案結構

```text
app/
├── components/              # UI 元件
│   ├── skeletons/           # Skeleton loading 元件
│   ├── AppHeader.tsx        # 全站共用導覽列
│   ├── ExportButton.tsx
│   ├── HistorySection.tsx
│   ├── ShareButton.tsx
│   ├── TemperatureInputCard.tsx
│   ├── ThemeProvider.tsx
│   └── WeatherChart.tsx
├── hooks/                   # 前端狀態與副作用
│   ├── useHistoryStore.ts
│   ├── useTemperatureConversion.ts
│   └── useWeatherDashboard.ts
├── lib/                     # 純函式與資料定義
│   ├── format.ts
│   ├── history.ts
│   ├── storage.ts           # localStorage/sessionStorage fallback 共用邏輯
│   ├── temperature.ts
│   ├── utils.ts
│   ├── weather.ts           # 天氣文字描述、城市預設值
│   ├── weatherApi.ts        # Open-Meteo API 存取層（純 fetch，無 React 依賴）
│   └── weatherPayload.ts    # API 回應/localStorage 資料轉換與驗證
├── types/                   # TypeScript 型別
├── weather/page.tsx         # 城市天氣頁
├── error.tsx                # App Router 錯誤邊界
├── globals.css              # Tailwind v4 與主題 token
├── layout.tsx               # 全站 metadata 與 Provider
├── manifest.ts              # Web App Manifest
├── page.tsx                 # 溫度轉換首頁
├── robots.ts
└── sitemap.ts
```

## 安裝與開發

### 環境需求

- Node.js 20.9+，符合 Next.js 16 的需求。
- npm 9+。

### 安裝

```bash
npm install
```

### 開發模式

```bash
npm run dev
```

預設會在 [http://localhost:3000](http://localhost:3000) 啟動。

### Production build

```bash
npm run build
npm start
```

### 品質檢查

```bash
npm run format
npm audit --audit-level=moderate
```

## 環境變數

| 變數                              | 用途                                                        |
| --------------------------------- | ----------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`            | sitemap、robots、canonical 與 metadata 使用的公開站台 URL。 |
| `NEXT_PUBLIC_GOOGLE_VERIFICATION` | Google Search Console 驗證碼，可選。                        |

## 安全與依賴

- 套件已更新到目前相容版本。
- `postcss` 透過 `overrides` 固定到安全版本，避免 Next 內部相依帶入已知漏洞版本。
- 已移除未使用的 `@typescript-eslint/*` 直接依賴與 `autoprefixer`。
- 最新驗證結果：`npm audit --audit-level=moderate` 為 0 vulnerabilities。

## 專案健康度

目前不需要大型重構。專案已依照職責拆成 `components`、`hooks`、`lib`、`types`，整體結構清楚。

已完成的清理與改版：

- 移除未被使用的 export（`formatWeatherTime`、`formatWeekday`、`formatCoordinate`、`formatShortcut`、`ThemeProvider` 的 `setTheme`、`TemperatureScale.accent` 裝飾漸層欄位）與重複型別宣告；`numberFormatter`、`WEATHER_CODE_MAP`、`isQuotaExceededError` 等僅供模組內使用的 export 也已改為模組私有。
- 將 `useHistoryStore` 與 `useWeatherDashboard` 重複的 localStorage/sessionStorage fallback 邏輯收斂進 `lib/storage.ts`。
- 修正 `/weather` 首次載入時淺色主題閃爍（FOUC）、對比度不足、行動裝置版面溢出等問題。
- 將配色系統正式收斂為 Tailwind v4 `@theme` design token（`bg-surface-strong`、`text-ink-strong`、`bg-accent` 等），全部元件（含 `HeroSection`、`HistorySection`、`InsightsSection`、`TemperatureInputCard`、`ThemeToggleButton`、`WeatherChart`）已 100% 改用真正的 token utility class，不再有任何 `bg-[var(--x)]` 任意值語法或殘留的舊版 `slate-*` 相容層；原本的青綠 `#00CECB`／珊瑚 `#FF5E5B` 溫標裝飾漸層已確認完全沒有使用者，直接移除而非保留死碼。
- 抽出共用 `AppHeader`，轉換器與天氣頁共用同一份導覽列與圓角/陰影規則。
- 為互動元件補上語意標籤與 ARIA：溫標選擇器與天氣預報天數改用 `radiogroup`/`radio` 並實作方向鍵瀏覽（roving tabindex）；匯出選單補上 `role="menu"` 與 Escape/焦點管理；天氣頁載入狀態補上 `aria-live`。
- 修正淺色主題兩處對比度未達 WCAG AA 的問題：次要文字色（`--text-subtle`）與天氣頁預報天數切換鈕的選中狀態文字色。
- 將 `useWeatherDashboard`（原本身兼 API 存取、資料驗證、React 狀態三種責任的單一 500+ 行 hook）拆成 `lib/weatherApi.ts`（純 API client）、`lib/weatherPayload.ts`（API 回應與 localStorage payload 的轉換/驗證）與精簡後只負責 React 狀態協調的 hook。
- 新增 `app/error.tsx`，路由內未預期的例外會顯示符合品牌風格的錯誤頁（含重試/返回首頁），而非 Next.js 預設畫面。
- 移除鍵盤快捷鍵功能（`useKeyboardShortcuts`、`KeyboardShortcutsHelp` 與首頁的相關按鈕/彈窗），非必要功能，已依需求整個拔除。

較適合後續漸進改善的方向如下：

- 補上單元測試，優先涵蓋 `lib/temperature.ts`、`lib/format.ts` 與 `lib/weatherPayload.ts` 的資料驗證邏輯。
- 若要主打完整 PWA 離線能力，可再加入 service worker 與快取策略；目前已具備 Web App Manifest。
- 補上 `/og-image.png`，讓 Open Graph/Twitter 分享圖完整。

## 可串接的第三方服務

- Analytics：Vercel Analytics、Plausible、Google Analytics 4。
- Error monitoring：Sentry。
- 地圖與地點：Mapbox、Google Maps Places、OpenStreetMap/Leaflet。
- 天氣進階資料：OpenWeather、WeatherAPI、Tomorrow.io，適合補天氣警報、雷達或更細緻的預報。
- 使用者資料與同步：Supabase、Firebase，適合跨裝置保存偏好與轉換紀錄。
- 通知：Web Push 或 Firebase Cloud Messaging，適合做天氣提醒。
- SEO：Google Search Console，目前已有 verification env 可接。
