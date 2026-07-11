import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { searchLocations } from "../lib/weatherApi";
import type { GeoApiLocation } from "../lib/weatherApi";
import { useWeatherSuggestions } from "./useWeatherSuggestions";

vi.mock("../lib/weatherApi", () => ({ searchLocations: vi.fn() }));

const tokyo: GeoApiLocation = {
  name: "Tokyo",
  country: "Japan",
  latitude: 35.68,
  longitude: 139.76,
};

const mockSearchLocations = vi.mocked(searchLocations);

beforeEach(() => {
  vi.useFakeTimers();
  mockSearchLocations.mockReset().mockResolvedValue([tokyo]);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("useWeatherSuggestions", () => {
  it("ignores short and already committed queries", async () => {
    const { result, rerender } = renderHook(
      ({ query, committed }) => useWeatherSuggestions(query, committed, true),
      { initialProps: { query: "T", committed: "Taipei" } },
    );

    await act(() => vi.runAllTimersAsync());
    expect(mockSearchLocations).not.toHaveBeenCalled();

    rerender({ query: "Taipei", committed: "Taipei" });
    await act(() => vi.runAllTimersAsync());
    expect(result.current.suggestions).toEqual([]);
    expect(result.current.suggestionsOpen).toBe(false);
  });

  it("debounces searches and opens matching suggestions", async () => {
    const { result } = renderHook(() =>
      useWeatherSuggestions("Tokyo", "Taipei", true),
    );

    await act(() => vi.advanceTimersByTimeAsync(349));
    expect(mockSearchLocations).not.toHaveBeenCalled();

    await act(() => vi.advanceTimersByTimeAsync(1));
    expect(mockSearchLocations).toHaveBeenCalledWith(
      "Tokyo",
      5,
      expect.any(AbortSignal),
    );
    expect(result.current.suggestions).toEqual([tokyo]);
    expect(result.current.suggestionsLoading).toBe(false);
    expect(result.current.suggestionsOpen).toBe(true);
  });

  it("closes stale results after the query is committed", async () => {
    const { result, rerender } = renderHook(
      ({ committed }) => useWeatherSuggestions("Tokyo", committed, true),
      { initialProps: { committed: "Taipei" } },
    );
    await act(() => vi.advanceTimersByTimeAsync(350));
    expect(result.current.suggestionsOpen).toBe(true);

    rerender({ committed: "Tokyo" });
    await act(async () => undefined);

    expect(result.current.suggestions).toEqual([]);
    expect(result.current.suggestionsOpen).toBe(false);
  });

  it("logs non-abort failures and returns to the idle state", async () => {
    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    mockSearchLocations.mockRejectedValueOnce(new Error("offline"));
    const { result } = renderHook(() =>
      useWeatherSuggestions("Tokyo", "Taipei", true),
    );

    await act(() => vi.advanceTimersByTimeAsync(350));

    expect(consoleSpy).toHaveBeenCalledWith(
      "searchLocations",
      expect.any(Error),
    );
    expect(result.current.suggestionsLoading).toBe(false);
    expect(result.current.suggestions).toEqual([]);
  });

  it("aborts the previous request when the query changes", async () => {
    let requestSignal: AbortSignal | undefined;
    mockSearchLocations.mockImplementationOnce(
      (_query, _count, signal) =>
        new Promise((_resolve, reject) => {
          if (!signal) throw new Error("Expected an abort signal");
          requestSignal = signal;
          signal.addEventListener("abort", () =>
            reject(new DOMException("Aborted", "AbortError")),
          );
        }),
    );
    const { rerender } = renderHook(
      ({ query }) => useWeatherSuggestions(query, "Taipei", true),
      { initialProps: { query: "Tokyo" } },
    );

    await act(() => vi.advanceTimersByTimeAsync(350));
    rerender({ query: "Osaka" });

    expect(requestSignal?.aborted).toBe(true);
  });

  it("does not search when the query was changed programmatically", async () => {
    const { result } = renderHook(() =>
      useWeatherSuggestions("Kaohsiung", "Taipei", false),
    );

    await act(() => vi.runAllTimersAsync());

    expect(mockSearchLocations).not.toHaveBeenCalled();
    expect(result.current.suggestions).toEqual([]);
    expect(result.current.suggestionsOpen).toBe(false);
  });
});
