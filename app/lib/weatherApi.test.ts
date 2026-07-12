import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  fetchAirQuality,
  fetchForecast,
  searchLocation,
  searchLocations,
} from "./weatherApi";

const mockFetch = vi.fn<typeof fetch>();

const response = (data: unknown, ok = true) =>
  ({
    ok,
    json: vi.fn().mockResolvedValue(data),
  }) as unknown as Response;

const validForecast = {
  current: {
    time: "2026-07-12T00:00",
    temperature_2m: 30,
    apparent_temperature: 33,
    relative_humidity_2m: 70,
    wind_speed_10m: 10,
    weather_code: 1,
    surface_pressure: 1005,
    precipitation: 0,
    uv_index: 6,
    is_day: 1,
  },
  daily: {
    time: ["2026-07-12"],
    temperature_2m_max: [32],
    temperature_2m_min: [25],
  },
};

beforeEach(() => {
  mockFetch.mockReset();
  vi.stubGlobal("fetch", mockFetch);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("weather API client", () => {
  it("encodes geocoding searches and returns results", async () => {
    mockFetch.mockResolvedValueOnce(
      response({
        results: [{ name: "New York", latitude: 40.7, longitude: -74 }],
      }),
    );

    const result = await searchLocations("New York", 5);

    expect(result).toHaveLength(1);
    const [requestUrl, options] = mockFetch.mock.calls[0];
    const url = new URL(`${requestUrl}`);
    expect(url.searchParams.get("name")).toBe("New York");
    expect(url.searchParams.get("count")).toBe("5");
    expect(options?.signal).toBeInstanceOf(AbortSignal);
  });

  it("reports missing locations and geocoding failures", async () => {
    mockFetch.mockResolvedValueOnce(response({ results: [] }));
    await expect(searchLocation("missing")).rejects.toThrow("找不到對應的地點");

    mockFetch.mockResolvedValueOnce(response({}, false));
    await expect(searchLocations("Taipei")).rejects.toThrow(
      "地理定位服務暫時無法使用",
    );
  });

  it("requests the selected forecast range", async () => {
    mockFetch.mockResolvedValueOnce(response(validForecast));

    await fetchForecast(25.04, 121.52, "Asia/Taipei", 14);

    const url = new URL(`${mockFetch.mock.calls[0][0]}`);
    expect(url.searchParams.get("forecast_days")).toBe("14");
    expect(url.searchParams.get("timezone")).toBe("Asia/Taipei");
    expect(url.searchParams.get("current")).toContain("uv_index");
  });

  it("throws when the forecast endpoint fails", async () => {
    mockFetch.mockResolvedValueOnce(response({}, false));
    await expect(fetchForecast(0, 0, "UTC", 7)).rejects.toThrow(
      "無法取得天氣資訊",
    );
  });

  it("rejects malformed successful responses", async () => {
    mockFetch.mockResolvedValueOnce(
      response({
        results: [{ name: "Taipei", latitude: "25", longitude: 121.5 }],
      }),
    );
    await expect(searchLocations("Taipei")).rejects.toThrow(
      "地理定位服務回傳了無效資料",
    );

    mockFetch.mockResolvedValueOnce(response({ current: {} }));
    await expect(fetchForecast(0, 0, "UTC", 7)).rejects.toThrow(
      "天氣服務回傳了無效資料",
    );
  });

  it("normalizes network failures and request timeouts", async () => {
    mockFetch.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    await expect(searchLocations("Taipei")).rejects.toThrow(
      "地理定位服務暫時無法使用",
    );

    vi.useFakeTimers();
    mockFetch.mockImplementationOnce(
      (_url, options) =>
        new Promise((_resolve, reject) => {
          options?.signal?.addEventListener("abort", () => {
            reject(new DOMException("Aborted", "AbortError"));
          });
        }),
    );
    const pendingRequest = searchLocations("Taipei");
    const timeoutExpectation =
      expect(pendingRequest).rejects.toThrow("服務回應逾時");
    await vi.advanceTimersByTimeAsync(10_000);
    await timeoutExpectation;
  });

  it("treats air quality as optional and only logs non-abort errors", async () => {
    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    mockFetch.mockRejectedValueOnce(new Error("offline"));
    await expect(fetchAirQuality(0, 0)).resolves.toBeNull();
    expect(consoleSpy).toHaveBeenCalledOnce();

    consoleSpy.mockClear();
    mockFetch.mockRejectedValueOnce(new DOMException("aborted", "AbortError"));
    await expect(fetchAirQuality(0, 0)).resolves.toBeNull();
    expect(consoleSpy).not.toHaveBeenCalled();

    const controller = new AbortController();
    controller.abort();
    mockFetch.mockRejectedValueOnce(new DOMException("aborted", "AbortError"));
    await expect(fetchAirQuality(0, 0, controller.signal)).rejects.toThrow(
      "aborted",
    );
  });
});
