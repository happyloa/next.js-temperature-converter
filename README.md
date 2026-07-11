# 溫度工作室 Temperature Studio

以 Next.js App Router 建置的溫度換算與全球城市天氣工具。首頁提供六種溫標的精確雙向換算；天氣頁整合 Open-Meteo 地理搜尋、預報與空氣品質資料。

線上版本：[next-js-temperature-convert.vercel.app](https://next-js-temperature-convert.vercel.app/)

## 主要功能

### 溫度換算

- 攝氏、華氏、Kelvin、蘭氏、列氏與牛頓氏即時互換。
- 文字輸入不受滑桿範圍截斷；低於絕對零度時顯示明確驗證訊息。
- 日常、烹飪、科學三種滑桿範圍，以及常用情境快速值。
- 冰點、沸點與太陽光球層的比較均附上物理條件說明。
- 最近 8 筆紀錄儲存在 localStorage，失敗時自動改用 sessionStorage。
- 支援單筆複製、Web Share，以及 CSV、JSON 與剪貼簿匯出。

### 城市天氣

- 城市建議採 350 ms debounce；只有送出、選擇建議或常用城市時才載入完整天氣。
- 支援瀏覽器座標定位，不依賴不穩定的反向地理端點。
- 顯示即時溫度、體感、濕度、風速、氣壓、降雨、UV、European AQI、PM2.5 與 PM10。
- 可切換 7 天或 14 天高低溫；切換時沿用現有座標，只更新預報。
- 天氣請求失敗時保留最後一次成功資料，並提供可見的錯誤與重試操作。

### 介面與可用性

- Server Page 負責 metadata 與靜態外殼，Client Workspace 僅承擔互動狀態。
- 桌機採工作區與側欄配置，手機改為單欄資訊流，並避免水平溢位。
- 深淺色主題使用系統字體，不依賴遠端字型載入。
- 溫標、滑桿情境、預報天數與城市建議皆支援鍵盤操作與 ARIA 語意。
- Production 回應包含 CSP、frame、referrer、content type 與 permissions 安全標頭。
- 包含 skip link、狀態播報、錯誤邊界、Open Graph 圖、sitemap、robots 與 Web App Manifest。

## 技術組成

| 類別      | 使用技術                                     |
| --------- | -------------------------------------------- |
| Framework | Next.js 16 App Router                        |
| UI        | React 19、TypeScript                         |
| Styling   | Tailwind CSS 4 與 CSS design tokens          |
| Icons     | Lucide React                                 |
| Chart     | Recharts，僅在用戶端延遲載入                 |
| Data      | Open-Meteo Geocoding、Forecast、Air Quality  |
| Unit test | Vitest、Testing Library、jsdom、V8 coverage  |
| E2E       | Playwright、axe，桌機 Chrome 與 Pixel 7      |
| Quality   | ESLint、Prettier、TypeScript、GitHub Actions |

## 依賴原則

正式環境只保留 Next.js、React／React DOM、Lucide 與 Recharts；條件 class 由專案內的小型 helper 處理，不再為此載入額外套件。其餘依賴皆用於編譯、型別、格式或自動化測試，axe 只在 Playwright E2E 中執行，不會進入瀏覽器 runtime bundle。

ESLint 9 與 TypeScript 6 是目前 `eslint-config-next` 內部 parser 支援的最新主版本。ESLint 10 與 TypeScript 7 會產生 peer warning，且 TypeScript 7 會讓 lint parser 啟動失敗，因此暫不升級這兩個不相容的大版本。

## 開始使用

需求：Node.js 20.9 以上與 npm。

```bash
npm install
npm run dev
```

開發伺服器預設位於 <http://localhost:3000>。

## 驗證指令

```bash
npm run format:check   # 格式檢查
npm run lint           # ESLint
npm run typecheck      # TypeScript
npm run test           # 70+ 項單元與 hook 測試
npm run test:coverage  # 含全域 coverage 門檻
npm run build          # Production build
npm run test:e2e       # port 3100 桌機/手機流程、響應式與 axe 掃描
npm run check          # 除 E2E 外的完整 CI 品質門檻
```

Windows 本機若未安裝 Playwright Chromium，E2E 預設使用 Microsoft Edge；CI 會安裝並使用 Chromium。

## 專案結構

```text
app/
├── components/
│   ├── temperature/             # 溫標選擇、結果與絕對溫度比較
│   ├── weather/                 # 天氣搜尋、現況、指標與預報元件
│   ├── skeletons/               # 穩定版面尺寸的載入狀態
│   ├── TemperatureStudioClient.tsx
│   └── WeatherChart.tsx         # 動態載入的 Recharts 圖表
├── hooks/
│   ├── useHistoryStore.ts
│   ├── useTemperatureConversion.ts
│   ├── useWeatherSuggestions.ts # debounce、取消與建議狀態
│   └── useWeatherDashboard.ts
├── lib/
│   ├── clipboard.ts             # Clipboard API 與安全 fallback
│   ├── export.ts                # CSV 匯出
│   ├── geolocation.ts           # 瀏覽器定位與錯誤訊息
│   ├── storage.ts               # local/session storage fallback
│   ├── temperature.ts           # 溫標公式與物理邊界
│   ├── uiStyles.ts              # 共用 Tailwind utility 組合
│   ├── weatherApi.ts            # Open-Meteo 存取層
│   └── weatherPayload.ts        # API 與快取資料轉換/驗證
├── weather/page.tsx             # 天氣 Server Page
├── layout.tsx
└── page.tsx                     # 轉換器 Server Page

e2e/                             # Playwright 桌機/手機流程
.github/workflows/quality.yml     # CI quality 與 E2E jobs
```

## 環境變數

| 變數                              | 用途                                                      |
| --------------------------------- | --------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`            | canonical、Open Graph、sitemap 與 robots 使用的公開網址。 |
| `NEXT_PUBLIC_GOOGLE_VERIFICATION` | Google Search Console 驗證碼，可選。                      |
| `PLAYWRIGHT_CHANNEL`              | 覆寫本機 E2E 瀏覽器 channel，可選。                       |

天氣與空氣品質資料來源為 [Open-Meteo](https://open-meteo.com/)；空氣品質模型來自 CAMS ENSEMBLE。所有環境指標僅供資訊參考。
