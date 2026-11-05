# 溫度工作室 Temperature Studio

溫度換算與城市天氣工具，以 Next.js App Router、React、TypeScript 和 Tailwind CSS 建置。天氣與空氣品質資料來自 [Open-Meteo](https://open-meteo.com/)。

線上版本：[next-js-temperature-convert.vercel.app](https://next-js-temperature-convert.vercel.app/)

## 功能

- 溫度換算：攝氏、華氏、Kelvin、蘭氏、列氏與牛頓氏即時互換。支援三種滑桿範圍與常用值；文字輸入保留完整數值，低於絕對零度時顯示錯誤。
- 紀錄與匯出：保留最近 8 筆換算，支援複製、Web Share、CSV 與 JSON 匯出。紀錄優先存於 localStorage，無法使用時改用 sessionStorage。
- 城市天氣：預設台北，可搜尋城市或使用瀏覽器定位。城市建議延遲 350 ms 查詢，確認選擇後才載入完整天氣。提供目前天氣、European AQI、PM2.5、PM10，以及 7／14 天高低溫預報。
- 快取與容錯：天氣快取 10 分鐘，過期後在背景更新；請求失敗時保留上次成功資料並提供重試。目前位置僅保留於工作階段。API 支援逾時、取消、資料驗證及一次 GET 重試，限流回應不會自動重試。
- 介面：支援深淺主題、鍵盤操作與狀態播報。寬度至少 768 px 時延遲載入 Recharts 折線圖，手機顯示逐日預報。使用系統字體，附分享圖、sitemap、robots、Web App Manifest 與安全回應標頭。

空氣品質模型來自 CAMS ENSEMBLE；空氣品質請求失敗不會阻塞主要天氣內容。環境指標僅供資訊參考。

## 開始使用

使用 Node.js 26 LTS 與隨附的 npm。開發環境與 CI 的版本固定於 [`.nvmrc`](.nvmrc)，Node 型別也採 26 系列。

```bash
nvm use
npm ci
npm run dev
```

未使用 nvm 時，請安裝 `.nvmrc` 指定的版本。開發伺服器位於 <http://localhost:3000>。Windows 若因執行原則無法呼叫 npm，可改用 `npm.cmd`。

## 環境變數

將 [`.env.example`](.env.example) 複製為 `.env.local`，依需要填寫：

| 變數                              | 用途                                          |
| --------------------------------- | --------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`            | canonical、Open Graph、sitemap 與 robots 網址 |
| `NEXT_PUBLIC_GOOGLE_VERIFICATION` | Google Search Console 驗證碼，可選            |

`NEXT_PUBLIC_*` 是公開設定，請勿填入機密。`.env.local` 不會提交至 Git。天氣查詢不需要 API key。

## 驗證

| 指令                 | 內容                                           |
| -------------------- | ---------------------------------------------- |
| `npm run check`      | 格式、lint、型別、單元測試與覆蓋率、正式建置   |
| `npm run test:e2e`   | Playwright 桌機／手機流程、版面溢位與 axe 掃描 |
| `npm audit`          | 已知依賴漏洞                                   |
| `npm run test:watch` | 監看單元測試                                   |
| `npm run format`     | 以 Prettier 格式化                             |

Biome 負責 lint，Prettier 負責格式，Vitest 搭配 Testing Library 與 jsdom 執行單元及 hook 測試。覆蓋率門檻設定於 `vitest.config.mts`。

本機 E2E 會啟動 port 3100 的開發伺服器；Windows 預設使用 Microsoft Edge，其他平台使用 Playwright Chromium。可透過 shell 環境變數 `PLAYWRIGHT_CHANNEL` 覆寫瀏覽器 channel。Chromium 安裝指令：

```bash
npx playwright install chromium
```

E2E 使用固定天氣 API 回應，涵蓋換算、驗證、紀錄、匯出選單、城市搜尋、預報切換、主題保存、跨頁導覽與 404。桌機圖表測試在手機跳過。

CI 執行 `npm ci`、漏洞檢查與 `npm run check`，再以正式建置執行 E2E；任何等級的已知漏洞都會使檢查失敗。本機可用 PowerShell 重現正式建置的 E2E：

```powershell
npm run build
$env:CI = "true"
try {
  npm run test:e2e
} finally {
  Remove-Item Env:CI
}
```

## 專案配置

`app/` 包含轉換器首頁與 `weather/` 天氣頁；`components/` 放介面元件，`hooks/` 管理互動與快取，`lib/` 處理溫標公式、API、資料驗證與儲存。單元測試與原始碼放在一起，E2E 位於 `e2e/`。

頁面由 Server Component 提供 metadata 與靜態內容，Client Component 處理輸入與本機狀態。Tailwind 透過 `@tailwindcss/postcss` 載入，主題 tokens 定義於 `app/globals.css`。

依賴版本與安裝結果記錄於 `package.json`、`package-lock.json`。PostCSS override 讓 Next.js 與建置工具共用更新版本；sharp 的安裝腳本由 `allowScripts` 明確允許。Dependabot 每週檢查 npm 與 GitHub Actions 更新，Actions 固定至發行版本的 commit。
