import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  fetchAirQuality,
  fetchForecast,
  searchLocation,
  searchLocations,
} from "../lib/weatherApi";
import type { ForecastApiResponse, GeoApiLocation } from "../lib/weatherApi";
import { useWeatherDashboard } from "./useWeatherDashboard";

vi.mock("../lib/weatherApi", () => ({
  fetchAirQuality: vi.fn(),
  fetchForecast: vi.fn(),
  searchLocation: vi.fn(),
  searchLocations: vi.fn(),
}));

const taipei: GeoApiLocation = {
  name: "Taipei",
  country: "Taiwan",
  admin1: "Taipei City",
  latitude: 25.04,
  longitude: 121.52,
  timezone: "Asia/Taipei",
};

const tokyo: GeoApiLocation = {
  name: "Tokyo",
  country: "Japan",
  admin1: "Tokyo",
  latitude: 35.68,
  longitude: 139.76,
  timezone: "Asia/Tokyo",
};

const createForecast = (days = 7): ForecastApiResponse => ({
  current: {
    time: "2026-07-10T12:00",
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
    time: Array.from(
      { length: days },
      (_, index) => `2026-07-${String(10 + index).padStart(2, "0")}`,
    ),
    temperature_2m_max: Array.from({ length: days }, (_, index) => 32 + index),
    temperature_2m_min: Array.from({ length: days }, (_, index) => 25 + index),
  },
  daily_units: {
    temperature_2m_max: "°C",
    temperature_2m_min: "°C",
  },
  timezone: "Asia/Taipei",
  timezone_abbreviation: "GMT+8",
  utc_offset_seconds: 28800,
});

const mockSearchLocation = vi.mocked(searchLocation);
const mockSearchLocations = vi.mocked(searchLocations);
const mockFetchForecast = vi.mocked(fetchForecast);
const mockFetchAirQuality = vi.mocked(fetchAirQuality);
const originalGeolocation = Object.getOwnPropertyDescriptor(
  navigator,
  "geolocation",
);

beforeEach(() => {
  mockSearchLocation.mockReset().mockResolvedValue(taipei);
  mockSearchLocations.mockReset().mockResolvedValue([tokyo]);
  mockFetchForecast.mockReset().mockResolvedValue(createForecast());
  mockFetchAirQuality.mockReset().mockResolvedValue(null);
});

afterEach(() => {
  if (originalGeolocation) {
    Object.defineProperty(navigator, "geolocation", originalGeolocation);
  } else {
    Reflect.deleteProperty(navigator, "geolocation");
  }
});

describe("useWeatherDashboard", () => {
  it("loads the default city once on mount", async () => {
    const { result } = renderHook(() => useWeatherDashboard("Taipei"));

    await waitFor(() =>
      expect(result.current.weatherData?.location).toBe("Taipei · Taiwan"),
    );

    expect(mockSearchLocation).toHaveBeenCalledTimes(1);
    expect(mockFetchForecast).toHaveBeenCalledTimes(1);
    expect(mockFetchAirQuality).toHaveBeenCalledTimes(1);
  });

  it("only searches suggestions while the user is typing", async () => {
    const { result } = renderHook(() => useWeatherDashboard("Taipei"));
    await waitFor(() => expect(result.current.weatherData).not.toBeNull());
    vi.clearAllMocks();

    act(() => result.current.handleWeatherQueryChange("Tokyo"));

    expect(mockSearchLocations).not.toHaveBeenCalled();
    expect(mockSearchLocation).not.toHaveBeenCalled();
    expect(mockFetchForecast).not.toHaveBeenCalled();

    await act(async () => {
      await new Promise((resolve) => window.setTimeout(resolve, 400));
    });

    expect(mockSearchLocations).toHaveBeenCalledTimes(1);
    expect(mockSearchLocations).toHaveBeenCalledWith(
      "Tokyo",
      5,
      expect.any(AbortSignal),
    );
    expect(mockSearchLocation).not.toHaveBeenCalled();
    expect(mockFetchForecast).not.toHaveBeenCalled();
  });

  it("performs one complete request when a city preset is selected", async () => {
    const { result } = renderHook(() => useWeatherDashboard("Taipei"));
    await waitFor(() => expect(result.current.weatherData).not.toBeNull());
    vi.clearAllMocks();
    mockSearchLocation.mockResolvedValue(tokyo);

    act(() => result.current.handleWeatherPreset("Tokyo"));

    await waitFor(() =>
      expect(result.current.weatherData?.location).toBe("Tokyo · Japan"),
    );
    expect(mockSearchLocation).toHaveBeenCalledTimes(1);
    expect(mockFetchForecast).toHaveBeenCalledTimes(1);
    expect(mockFetchAirQuality).toHaveBeenCalledTimes(1);
  });

  it("updates forecast days without repeating geocoding or air-quality calls", async () => {
    const { result } = renderHook(() => useWeatherDashboard("Taipei"));
    await waitFor(() => expect(result.current.weatherData).not.toBeNull());
    vi.clearAllMocks();
    mockFetchForecast.mockResolvedValue(createForecast(14));
    act(() => result.current.handleWeatherQueryChange("Tokyo"));

    await act(async () => {
      await result.current.setForecastDays(14);
    });

    await waitFor(() => expect(result.current.forecastDays).toBe(14));
    await waitFor(() =>
      expect(result.current.weatherData?.dailyForecast).toHaveLength(14),
    );
    expect(mockFetchForecast).toHaveBeenCalledTimes(1);
    expect(mockFetchForecast).toHaveBeenCalledWith(
      25.04,
      121.52,
      "Asia/Taipei",
      14,
      expect.any(AbortSignal),
    );
    expect(mockSearchLocation).not.toHaveBeenCalled();
    expect(mockFetchAirQuality).not.toHaveBeenCalled();
    expect(
      JSON.parse(localStorage.getItem("weather-dashboard-state") ?? "null")
        .query,
    ).toBe("Taipei");
  });

  it("keeps the last successful data when a refresh fails", async () => {
    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const { result } = renderHook(() => useWeatherDashboard("Taipei"));
    await waitFor(() => expect(result.current.weatherData).not.toBeNull());
    const previousData = result.current.weatherData;
    mockFetchForecast.mockRejectedValueOnce(new Error("offline"));

    act(() => result.current.handleWeatherPreset("Tokyo"));

    await waitFor(() => expect(result.current.weatherError).toBe("offline"));
    expect(result.current.weatherData).toEqual(previousData);
    consoleSpy.mockRestore();
  });

  it("rejects an empty submitted query without making a request", async () => {
    const { result } = renderHook(() => useWeatherDashboard("Taipei"));
    await waitFor(() => expect(result.current.weatherData).not.toBeNull());
    vi.clearAllMocks();

    act(() => result.current.handleWeatherQueryChange("   "));
    const preventDefault = vi.fn();
    act(() => result.current.handleWeatherSubmit({ preventDefault } as never));

    expect(preventDefault).toHaveBeenCalledOnce();
    expect(result.current.weatherError).toBe("請輸入地點名稱");
    expect(mockSearchLocation).not.toHaveBeenCalled();
    expect(mockFetchForecast).not.toHaveBeenCalled();
  });

  it("uses a selected suggestion without geocoding it again", async () => {
    const { result } = renderHook(() => useWeatherDashboard("Taipei"));
    await waitFor(() => expect(result.current.weatherData).not.toBeNull());
    vi.clearAllMocks();

    act(() => result.current.handleSuggestionSelect(tokyo));

    await waitFor(() =>
      expect(result.current.weatherData?.location).toBe("Tokyo · Japan"),
    );
    expect(mockSearchLocation).not.toHaveBeenCalled();
    expect(mockFetchForecast).toHaveBeenCalledWith(
      tokyo.latitude,
      tokyo.longitude,
      tokyo.timezone,
      7,
      expect.any(AbortSignal),
    );
  });

  it("does not reload an already selected forecast range", async () => {
    const { result } = renderHook(() => useWeatherDashboard("Taipei"));
    await waitFor(() => expect(result.current.weatherData).not.toBeNull());
    vi.clearAllMocks();

    await act(() => result.current.setForecastDays(7));

    expect(mockFetchForecast).not.toHaveBeenCalled();
    expect(result.current.forecastDays).toBe(7);
  });

  it("keeps existing forecast data when a range update fails", async () => {
    const { result } = renderHook(() => useWeatherDashboard("Taipei"));
    await waitFor(() => expect(result.current.weatherData).not.toBeNull());
    const previousForecast = result.current.weatherData?.dailyForecast;
    mockFetchForecast.mockRejectedValueOnce(new Error("offline"));

    await act(() => result.current.setForecastDays(14));

    expect(result.current.weatherError).toBe(
      "無法更新預報天數，目前仍顯示先前資料。",
    );
    expect(result.current.weatherData?.dailyForecast).toEqual(previousForecast);
    expect(result.current.forecastLoading).toBe(false);
  });

  it("reports unsupported geolocation without starting a request", async () => {
    Reflect.deleteProperty(navigator, "geolocation");
    const { result } = renderHook(() => useWeatherDashboard("Taipei"));
    await waitFor(() => expect(result.current.weatherData).not.toBeNull());
    vi.clearAllMocks();

    await act(() => result.current.handleGeolocate());

    expect(result.current.weatherError).toBe("您的瀏覽器不支援地理位置功能");
    expect(mockFetchForecast).not.toHaveBeenCalled();
  });

  it("loads weather for the browser's current coordinates", async () => {
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition: (resolve: PositionCallback) =>
          resolve({
            coords: { latitude: 24.15, longitude: 120.68 },
          } as GeolocationPosition),
      },
    });
    const { result } = renderHook(() => useWeatherDashboard("Taipei"));
    await waitFor(() => expect(result.current.weatherData).not.toBeNull());
    vi.clearAllMocks();

    await act(() => result.current.handleGeolocate());

    expect(result.current.weatherQuery).toBe("目前位置");
    expect(mockSearchLocation).not.toHaveBeenCalled();
    expect(mockFetchForecast).toHaveBeenCalledWith(
      24.15,
      120.68,
      "auto",
      7,
      expect.any(AbortSignal),
    );
    expect(result.current.geolocating).toBe(false);
  });
});
