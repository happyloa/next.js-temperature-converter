# 溫度工作室 Temperature Studio

六種溫標即時換算與全球城市天氣，以 Next.js App Router、React、TypeScript 與 Tailwind CSS 建置。天氣與空氣品質資料來自 [Open-Meteo](https://open-meteo.com/)。

線上版本：<https://next-js-temperature-convert.vercel.app/>

## 功能

- **溫度換算**：攝氏、華氏、Kelvin、蘭氏、列氏與牛頓氏互換，提供常用值、三種滑桿範圍與絕對零度檢查。
- **紀錄**：保留最近 8 筆，可複製、分享或匯出 CSV／JSON。
- **天氣**：搜尋城市或使用定位，顯示目前天氣、European AQI、PM2.5／PM10 與 7／14 日預報。資料快取 10 分鐘，請求失敗時保留上次結果。
- **介面**：深淺主題（未手動切換時跟隨系統）、完整鍵盤操作、PWA manifest 與安全回應標頭。

## 開發

使用 [`.nvmrc`](.nvmrc) 指定的 Node.js 版本：

```bash
nvm use
npm ci
npm run dev   # http://localhost:3000
```

選用環境變數（將 [`.env.example`](.env.example) 複製為 `.env.local`）：

| 變數                              | 用途                                          |
| --------------------------------- | --------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`            | canonical、Open Graph、sitemap 與 robots 網址 |
| `NEXT_PUBLIC_GOOGLE_VERIFICATION` | Google Search Console 驗證碼                  |

## 驗證

| 指令               | 內容                                             |
| ------------------ | ------------------------------------------------ |
| `npm run check`    | Prettier、Biome、型別、Vitest 與覆蓋率、正式建置 |
| `npm run test:e2e` | Playwright 桌機／手機流程與 axe 無障礙掃描       |
| `npm run format`   | 以 Prettier 格式化                               |

E2E 會在 port 3100 啟動開發伺服器。Windows 預設使用 Edge，其他平台需先執行 `npx playwright install chromium`，也可用 `PLAYWRIGHT_CHANNEL` 指定瀏覽器。設定 `CI=true` 時改用正式建置（需先 `npm run build`）。

CI 會執行 `npm audit`、`npm run check` 與正式建置的 E2E，任何等級的已知漏洞都會讓檢查失敗。

## 結構

- `app/`：頁面、metadata 路由、錯誤頁與 404
- `app/components/`、`app/hooks/`：介面元件與互動狀態
- `app/lib/`：溫標公式、Open-Meteo 用戶端、資料驗證、儲存與主題
- `e2e/`：Playwright 測試；單元測試與原始碼放在一起
