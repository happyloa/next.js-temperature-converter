import { defineConfig, devices } from "@playwright/test";

const isCI = Boolean(process.env.CI);
const channel =
  process.env.PLAYWRIGHT_CHANNEL ??
  (process.platform === "win32" ? "msedge" : undefined);

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  reporter: isCI
    ? [
        ["github"],
        ["html", { open: "never", outputFolder: "playwright-report" }],
      ]
    : "list",
  use: {
    baseURL: "http://localhost:3100",
    channel,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 7"] },
    },
  ],
  webServer: {
    command: isCI
      ? "npm run start -- --port 3100"
      : "npm run dev -- --port 3100",
    url: "http://localhost:3100",
    reuseExistingServer: !isCI,
    timeout: 120_000,
  },
});
