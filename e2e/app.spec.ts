import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("temperature conversion remains exact and usable", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");

  await expect(
    page.getByRole("heading", { name: "溫度轉換器", level: 1 }),
  ).toBeVisible();

  const input = page.getByPlaceholder("例如 25");
  await input.fill("1000");
  await expect(
    page.getByText("目前輸入超出此滑桿情境，但轉換結果仍使用完整輸入值。"),
  ).toBeVisible();
  await expect(
    page.getByRole("listitem").filter({ hasText: "攝氏" }),
  ).toContainText("1,000");

  await input.fill("-300");
  await expect(page.locator("#temperature-input-help")).toContainText(
    "不能低於絕對零度",
  );
  await expect(page.getByText("0 / 6")).toBeVisible();

  await input.fill("100");
  await expect(
    page.getByRole("listitem").filter({ hasText: "華氏" }),
  ).toContainText("212");
  await page.getByRole("button", { name: "加入紀錄" }).click();
  await expect(
    page.getByRole("region", { name: "轉換紀錄" }).locator("details"),
  ).toHaveCount(1);

  const html = page.locator("html");
  const initialTheme = await html.getAttribute("data-theme");
  await page.getByRole("button", { name: /切換為.+主題/ }).click();
  await expect(html).not.toHaveAttribute("data-theme", initialTheme ?? "");

  await expectPageNotToOverflow(page);
  await expectNoSeriousAccessibilityViolations(page);
});

test("weather search avoids duplicate full requests", async ({ page }) => {
  const requests = await mockWeatherApis(page);
  await page.goto("/weather");
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");

  await expect(
    page.getByRole("heading", { name: "Taipei · Taiwan" }),
  ).toBeVisible();
  await expectWeatherLayout(page);
  expect(requests.forecast).toBe(1);
  expect(requests.airQuality).toBe(1);
  expect(requests.geocodeLookup).toBe(1);

  const search = page.getByRole("combobox", { name: "搜尋全球城市" });
  const searchForm = page.getByRole("search");
  const initialFormBox = await searchForm.boundingBox();
  await search.fill("Tokyo");
  await expect(search).toHaveAttribute("aria-busy", "true");
  const loadingFormBox = await searchForm.boundingBox();
  expect(initialFormBox).not.toBeNull();
  expect(loadingFormBox).not.toBeNull();
  if (initialFormBox && loadingFormBox) {
    expect(
      Math.abs(initialFormBox.height - loadingFormBox.height),
    ).toBeLessThan(1);
  }
  await expect(page.getByRole("option", { name: /Tokyo/ })).toBeVisible();
  expect(requests.suggestions).toBe(1);
  expect(requests.forecast).toBe(1);

  await search.press("ArrowDown");
  await search.press("Enter");
  await expect(
    page.getByRole("heading", { name: "Tokyo · Japan" }),
  ).toBeVisible();
  expect(requests.forecast).toBe(2);
  expect(requests.airQuality).toBe(2);
  expect(requests.geocodeLookup).toBe(1);

  await page.getByRole("radio", { name: "14 天" }).click();
  await expect(page.getByText("未來 14 天的每日高低溫")).toBeVisible();
  await expect.poll(() => requests.forecast).toBe(3);
  expect(requests.airQuality).toBe(2);
  expect(requests.geocodeLookup).toBe(1);

  await expectPageNotToOverflow(page);
  await expectNoSeriousAccessibilityViolations(page);
});

test("city presets do not open location suggestions", async ({ page }) => {
  const requests = await mockWeatherApis(page);
  await page.goto("/weather");
  await expect(
    page.getByRole("heading", { name: "Taipei · Taiwan" }),
  ).toBeVisible();

  const searchForm = page.getByRole("search");
  const initialFormBox = await searchForm.boundingBox();
  await page.getByRole("button", { name: "高雄", exact: true }).click();

  await expect(
    page.getByRole("combobox", { name: "搜尋全球城市" }),
  ).toHaveValue("Kaohsiung");
  await expect.poll(() => requests.forecast).toBe(2);
  await page.waitForTimeout(450);

  expect(requests.suggestions).toBe(0);
  await expect(page.getByRole("listbox")).toHaveCount(0);
  const finalFormBox = await searchForm.boundingBox();
  expect(initialFormBox).not.toBeNull();
  expect(finalFormBox).not.toBeNull();
  if (initialFormBox && finalFormBox) {
    expect(Math.abs(initialFormBox.height - finalFormBox.height)).toBeLessThan(
      1,
    );
  }
});

async function expectPageNotToOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
}

async function expectNoSeriousAccessibilityViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const violations = results.violations.filter(
    ({ impact }) => impact === "serious" || impact === "critical",
  );

  expect(violations).toEqual([]);
}

async function expectWeatherLayout(page: Page) {
  const viewportWidth = page.viewportSize()?.width ?? 0;
  const titleBox = await page
    .getByRole("heading", { name: "溫度趨勢" })
    .boundingBox();
  const rangeBox = await page
    .getByRole("radiogroup", { name: "預報天數" })
    .boundingBox();

  expect(titleBox).not.toBeNull();
  expect(rangeBox).not.toBeNull();
  if (viewportWidth <= 760 && titleBox && rangeBox) {
    expect(titleBox.y + titleBox.height).toBeLessThanOrEqual(rangeBox.y);
  }

  if (viewportWidth >= 900) {
    const metricBoxes = await page
      .locator('section[aria-labelledby="environment-title"] > div')
      .nth(1)
      .locator(":scope > div")
      .evaluateAll((elements) =>
        elements.map((element) => {
          const box = element.getBoundingClientRect();
          return { top: box.top, left: box.left };
        }),
      );

    expect(metricBoxes).toHaveLength(6);
    expect(Math.abs(metricBoxes[3].top - metricBoxes[5].top)).toBeLessThan(1);
  }
}

async function mockWeatherApis(page: Page) {
  const requests = {
    suggestions: 0,
    geocodeLookup: 0,
    forecast: 0,
    airQuality: 0,
  };

  await page.route("https://geocoding-api.open-meteo.com/**", async (route) => {
    const url = new URL(route.request().url());
    const isSuggestion = url.searchParams.get("count") === "5";
    const isTokyo = url.searchParams.get("name")?.toLowerCase() === "tokyo";
    if (isSuggestion) requests.suggestions += 1;
    else requests.geocodeLookup += 1;

    if (isSuggestion) {
      await new Promise((resolve) => setTimeout(resolve, 120));
    }

    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        results: [
          isTokyo
            ? {
                id: 2,
                name: "Tokyo",
                country: "Japan",
                admin1: "Tokyo",
                latitude: 35.68,
                longitude: 139.76,
                timezone: "Asia/Tokyo",
              }
            : {
                id: 1,
                name: "Taipei",
                country: "Taiwan",
                admin1: "Taipei City",
                latitude: 25.04,
                longitude: 121.52,
                timezone: "Asia/Taipei",
              },
        ],
      }),
    });
  });

  await page.route("https://api.open-meteo.com/**", async (route) => {
    requests.forecast += 1;
    const url = new URL(route.request().url());
    const days = Number(url.searchParams.get("forecast_days") ?? 7);
    const isTokyo = url.searchParams.get("latitude")?.startsWith("35.68");
    const dailyDates = Array.from({ length: days }, (_, index) => {
      const date = new Date(Date.UTC(2026, 6, 10 + index));
      return date.toISOString().slice(0, 10);
    });

    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        current: {
          time: "2026-07-10T12:00",
          temperature_2m: isTokyo ? 29 : 31,
          apparent_temperature: isTokyo ? 31 : 35,
          relative_humidity_2m: 68,
          wind_speed_10m: 12,
          weather_code: 2,
          surface_pressure: 1003,
          precipitation: 0.2,
          uv_index: 7,
          is_day: 1,
        },
        current_units: {
          temperature_2m: "°C",
          apparent_temperature: "°C",
          relative_humidity_2m: "%",
          wind_speed_10m: "km/h",
          surface_pressure: "hPa",
          precipitation: "mm",
          uv_index: "",
        },
        daily: {
          time: dailyDates,
          temperature_2m_max: dailyDates.map((_, index) => 34 + (index % 3)),
          temperature_2m_min: dailyDates.map((_, index) => 25 + (index % 2)),
        },
        daily_units: {
          temperature_2m_max: "°C",
          temperature_2m_min: "°C",
        },
        timezone: isTokyo ? "Asia/Tokyo" : "Asia/Taipei",
        timezone_abbreviation: isTokyo ? "GMT+9" : "GMT+8",
        utc_offset_seconds: isTokyo ? 32400 : 28800,
      }),
    });
  });

  await page.route(
    "https://air-quality-api.open-meteo.com/**",
    async (route) => {
      requests.airQuality += 1;
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          current: {
            european_aqi: 42,
            pm2_5: 12.5,
            pm10: 24,
            time: "2026-07-10T12:00",
          },
          current_units: {
            european_aqi: "EAQI",
            pm2_5: "µg/m³",
            pm10: "µg/m³",
          },
        }),
      });
    },
  );

  return requests;
}
