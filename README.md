# 溫度工作室 Temperature Studio

以 Next.js App Router 建置的溫度換算與城市天氣工具。首頁支援六種溫標即時互換；天氣頁提供全球城市搜尋、目前天氣、空氣品質與高低溫預報，資料來自 Open-Meteo。

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

- 預設載入台北天氣。輸入城市後等待 350 ms 顯示建議；送出查詢、選擇建議或常用城市後，才載入新城市的完整天氣。
- 支援瀏覽器座標定位，不依賴不穩定的反向地理端點。
- 顯示即時溫度、體感、濕度、風速、氣壓、降雨、UV、European AQI、PM2.5 與 PM10。
- 可切換 7 天或 14 天高低溫；切換時沿用現有座標，只更新預報。
- 視窗寬度至少 768 px 時，延遲載入互動折線圖；小螢幕顯示逐日高低溫清單。
- 最近成功的天氣資料快取 10 分鐘；過期後在背景更新，並清楚標示資料是否可能過期。
- 瀏覽器目前位置只保留於這個工作階段，不會寫入長期 localStorage；天氣請求失敗時保留最後一次成功資料，並提供可見的錯誤與重試操作。

### 介面與可用性

- 依 [frontend-design](https://github.com/Ilm-Alan/frontend-design) 的 Swiss 方向設計，以白色、中性灰、藍色與細線網格呈現資訊；輸入值與目前溫度使用大型數字。
- 頁面由 Server Component 提供 metadata 與靜態內容，Client Component 處理輸入、查詢與本機狀態。
- 桌機採工作區與側欄配置，手機改為單欄資訊流，並避免水平溢位。
- 深色主題沿用中性灰與藍色，主題選擇會保存在本機。字體採 Helvetica 系列與中文系統字體，不需下載遠端字型。
- 溫標、滑桿情境、預報天數與城市建議皆支援鍵盤操作與 ARIA 語意。
- Production 回應包含 CSP、frame、referrer、content type 與 permissions 安全標頭。
- 包含跳至主要內容的連結、狀態播報、錯誤重試、404 頁、Open Graph 分享圖、sitemap、robots 與 Web App Manifest。

## 技術組成

| 類別      | 使用技術                                       |
| --------- | ---------------------------------------------- |
| Framework | Next.js 16.4 App Router                        |
| UI        | React 19.3、TypeScript 7                       |
| Styling   | Tailwind CSS 4 與 CSS design tokens            |
| Icons     | Lucide React                                   |
| Chart     | Recharts 3，視窗寬度至少 768 px 時在用戶端載入 |
| Data      | Open-Meteo Geocoding、Forecast、Air Quality    |
| Unit test | Vitest、Testing Library、jsdom、V8 coverage    |
| E2E       | Playwright、axe，桌機 Chromium 與 Pixel 7      |
| Quality   | Biome、Prettier、TypeScript、GitHub Actions    |

## 依賴原則

正式依賴為 Next.js、React／React DOM、Lucide 與 Recharts。條件樣式由專案內的 `cn` helper 處理；其餘套件用於編譯、型別、格式或測試。axe 只在 Playwright E2E 中執行，不會進入網站的瀏覽器套件。

Biome 負責程式碼檢查，Prettier 負責格式檢查，TypeScript 負責嚴格型別檢查。Node 型別維持 24 系列，與 CI 固定使用的 Node 24 一致。依賴版本與安裝結果分別記錄在 `package.json` 和 `package-lock.json`。

## 開始使用

支援範圍：Node.js `^22.22.2`、`^24.15.0` 或 `>=26.0.0`，以及 npm。CI 與建議的開發環境固定使用 [`.nvmrc`](.nvmrc) 中的 Node.js 24.20.0，以符合目前 Vitest 與 jsdom 的實際引擎需求。

```bash
nvm use
npm ci
npm run dev
```

未使用 nvm 時，請安裝上述相容版本後執行 `npm ci`。開發伺服器預設位於 <http://localhost:3000>。

## 驗證指令

```bash
npm run format:check   # 格式檢查
npm run lint           # Biome
npm run typecheck      # TypeScript
npm run test           # 單元與 hook 測試
npm run test:coverage  # 含全域 coverage 門檻
npm run build          # Production build
npm run test:e2e       # 本機以 dev server 跑 port 3100 的桌機/手機流程、響應式與 axe 掃描
npm run check          # 除 E2E 外的完整 CI 品質門檻
```

Windows 本機 E2E 預設使用 Microsoft Edge；其他平台使用 Playwright Chromium，可先執行 `npx playwright install chromium` 安裝瀏覽器。CI 會安裝 Chromium、先建置正式版本，再以 `next start` 執行 E2E，並檢查 high 以上的 npm 漏洞。

E2E 涵蓋轉換與驗證、複製、紀錄與匯出選單、城市搜尋與鍵盤選擇、預報切換、跨頁導覽、主題與紀錄保存，以及 404 返回首頁；同時檢查版面溢位與嚴重無障礙問題。天氣流程使用固定 API 回應，方便重現查詢次數與載入狀態；桌機圖表測試會在手機跳過。

本機要重現 CI 的正式建置流程，可在 PowerShell 執行：

```powershell
npm run build
$env:CI = "true"
npm run test:e2e
Remove-Item Env:CI
```

`npm audit` 可檢查全部已知漏洞；CI 使用 `npm audit --audit-level=high` 阻擋高風險以上的問題。Windows 若因執行原則無法呼叫 npm，可改用 `npm.cmd`。

Dependabot 會每週檢查 npm 與 GitHub Actions 相依更新；CI 會在較新的同分支提交到達時取消舊的執行，以避免重複耗用資源。

## 專案結構

```text
app/
├── components/
│   ├── temperature/             # 溫標選擇、結果與絕對溫度比較
│   ├── weather/                 # 天氣搜尋、現況、指標與預報元件
│   ├── skeletons/               # 穩定版面尺寸的載入狀態
│   ├── AppHeader.tsx            # 共用導覽與主題切換
│   ├── AppFooter.tsx            # 共用頁尾
│   ├── TemperatureStudioClient.tsx
│   └── WeatherChart.tsx         # 動態載入的 Recharts 圖表
├── hooks/
│   ├── useHistoryStore.ts
│   ├── useTemperatureConversion.ts
│   ├── useWeatherSuggestions.ts # debounce、取消與建議狀態
│   └── useWeatherDashboard.ts
├── lib/
│   ├── async.ts                 # 非同步取消判斷
│   ├── clipboard.ts             # Clipboard API 與安全 fallback
│   ├── export.ts                # CSV 匯出
│   ├── geolocation.ts           # 瀏覽器定位與錯誤訊息
│   ├── storage.ts               # local/session storage fallback
│   ├── temperature.ts           # 溫標公式與物理邊界
│   ├── uiStyles.ts              # 共用 Tailwind utility 組合
│   ├── weatherApi.ts            # Open-Meteo 存取層
│   └── weatherPayload.ts        # API 與快取資料轉換/驗證
├── weather/page.tsx             # 天氣 Server Page
├── error.tsx                    # 例外重試畫面
├── not-found.tsx                # 自訂 404 頁
├── globals.css                  # 主題色彩與全站基礎樣式
├── icon.svg                     # 網站與 Web App 圖示
├── manifest.ts                  # Web App Manifest
├── opengraph-image.tsx          # 分享圖
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

可將 [`.env.example`](.env.example) 複製為 `.env.local` 後填寫前兩個值；所有 `.env*` 檔都會被 Git 忽略，僅範本可提交。`NEXT_PUBLIC_*` 會公開給瀏覽器，不能放入密碼或其他機密。`PLAYWRIGHT_CHANNEL` 是命令列／CI 環境變數，請由 shell 或 CI 設定。

天氣與空氣品質資料來源為 [Open-Meteo](https://open-meteo.com/)；空氣品質模型來自 CAMS ENSEMBLE。API 請求具備逾時、取消、回應資料驗證與一次短暫的安全 GET 重試；服務限流不會自動重試。空氣品質失敗時不會阻塞主要天氣內容。所有環境指標僅供資訊參考。
