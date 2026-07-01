# 溫度工作室 Temperature Studio

基於 Next.js 16 App Router 打造的溫度轉換與全球天氣儀表板。支援六種溫標即時互換，並整合 [Open-Meteo](https://open-meteo.com/) 的城市天氣、空氣品質與趨勢圖表，提供轉換紀錄、分享匯出與深淺色主題。

🔗 線上 Demo：[next-js-temperature-convert.vercel.app](https://next-js-temperature-convert.vercel.app/)

## 功能

### 溫度轉換

- 支援攝氏、華氏、絕對溫標（K）、蘭氏、列氏、牛頓氏，六種溫標雙向即時互換。
- 數值輸入欄位與範圍滑桿雙向連動。
- 常用情境預設值（冰點、體溫、咖啡沖泡、太陽表面溫度等）一鍵套用。
- 依輸入溫度自動產生情境洞察，例如距離冰點/沸點的差距與溫度感受提示。
- 最近 8 筆轉換紀錄自動保存在瀏覽器（localStorage，寫入失敗時退回 sessionStorage）。
- 支援複製單一數值、分享（Web Share API，裝置不支援時退回剪貼簿）、匯出 CSV/JSON。

### 城市天氣

- 以 Open-Meteo Geocoding API 搜尋任意城市，或用瀏覽器 Geolocation 反查目前所在城市。
- 顯示即時溫度、體感溫度、濕度、風速、氣壓、降雨量、UV 指數，以及 AQI、PM2.5、PM10 空氣品質。
- 7 天／14 天高低溫趨勢圖（Recharts），切換天數時以 skeleton 佔位避免版面跳動。

### 介面體驗

- 首頁與天氣頁共用同一份導覽列（`AppHeader`）與視覺設計系統，深淺主題切換即時生效、不閃爍。
- 全站字體採用思源黑體（Noto Sans TC），透過 `next/font/google` 自動載入與子集化。
- 具備鍵盤可操作的互動元件（方向鍵切換溫標/預報天數、對話框焦點管理）與螢幕報讀器所需的 ARIA 標記。
- 具備自訂錯誤頁（`app/error.tsx`）與動態產生的社群分享圖（`app/opengraph-image.tsx`）。
- 具備 SEO metadata、`robots.txt`、`sitemap.xml` 與 Web App Manifest。

## 技術棧

| 項目 | 選擇 |
| --- | --- |
| Framework | Next.js 16（App Router） |
| Language | TypeScript |
| UI | React 19 |
| Styling | Tailwind CSS 4（`@theme` design token，支援深淺主題） |
| Chart | Recharts |
| Font | `next/font/google`（Noto Sans TC） |
| Weather API | Open-Meteo（Geocoding / Forecast / Air Quality） |

## 快速開始

需求：Node.js 20.9+、npm 9+。

```bash
npm install       # 安裝依賴
npm run dev       # 開發模式，預設 http://localhost:3000
npm run build     # Production build
npm start         # 啟動 production 伺服器
npm run format    # 用 Prettier 格式化整個專案
```

## 專案結構

```text
app/
├── components/
│   ├── skeletons/              # 各區塊的 loading skeleton
│   ├── AppHeader.tsx           # 全站共用導覽列
│   ├── ExportButton.tsx        # 轉換紀錄匯出（CSV/JSON/剪貼簿）
│   ├── HeroSection.tsx         # 首頁頂部橫幅與溫度預設值
│   ├── HistorySection.tsx      # 轉換紀錄手風琴列表
│   ├── InsightsSection.tsx     # 依輸入溫度產生的情境洞察
│   ├── ShareButton.tsx         # Web Share API／剪貼簿分享
│   ├── TemperatureInputCard.tsx # 溫標選擇、輸入欄位、轉換結果卡片
│   ├── ThemeProvider.tsx       # 深淺主題 context
│   ├── ThemeToggleButton.tsx   # 主題切換按鈕
│   └── WeatherChart.tsx        # 天氣趨勢圖（Recharts）
├── hooks/
│   ├── useHistoryStore.ts      # 轉換紀錄讀寫與 storage fallback
│   ├── useTemperatureConversion.ts # 溫度轉換核心狀態
│   └── useWeatherDashboard.ts  # 天氣查詢的 React 狀態協調
├── lib/
│   ├── format.ts                # 數值/時間格式化
│   ├── history.ts                # 轉換紀錄的驗證與型別守門
│   ├── storage.ts                # localStorage/sessionStorage fallback 共用邏輯
│   ├── temperature.ts            # 溫標定義與轉換公式
│   ├── utils.ts                  # cn() 與鍵盤方向鍵導覽等共用工具
│   ├── weather.ts                # 天氣代碼文字描述、城市預設值
│   ├── weatherApi.ts             # Open-Meteo API 存取層（純 fetch，無 React 依賴）
│   └── weatherPayload.ts         # API 回應／localStorage 資料轉換與驗證
├── types/                        # TypeScript 型別定義
├── weather/page.tsx              # 城市天氣頁（/weather）
├── error.tsx                     # App Router 錯誤邊界
├── globals.css                   # Tailwind v4 設定與主題 design token
├── layout.tsx                    # 全站 metadata、字體與 Provider
├── manifest.ts                   # Web App Manifest
├── opengraph-image.tsx           # 動態產生社群分享圖
├── page.tsx                      # 溫度轉換首頁（/）
├── robots.ts
└── sitemap.ts
```

## 環境變數

| 變數 | 用途 |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | sitemap、robots、canonical、Open Graph 分享圖等使用的公開站台網址。 |
| `NEXT_PUBLIC_GOOGLE_VERIFICATION` | Google Search Console 驗證碼，可選。 |
