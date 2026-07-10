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

beforeEach(() => {
  mockFetch.mockReset();
  vi.stubGlobal("fetch", mockFetch);
});

afterEach(() => {
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
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("name=New%20York&count=5"),
      { signal: undefined },
    );
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
    mockFetch.mockResolvedValueOnce(response({ current: {} }));

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
  });
});
