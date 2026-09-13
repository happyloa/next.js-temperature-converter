import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useTransientState } from "./useTransientState";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("useTransientState", () => {
  it.each(["copied", "error"])(
    "keeps a newer %s notification visible for its full duration",
    async (nextValue) => {
      const { result } = renderHook(() => useTransientState("idle"));
      act(() => result.current[1]("copied"));
      await act(() => vi.advanceTimersByTimeAsync(1500));
      act(() => result.current[1](nextValue));

      await act(() => vi.advanceTimersByTimeAsync(500));
      expect(result.current[0]).toBe(nextValue);
      await act(() => vi.advanceTimersByTimeAsync(1500));
      expect(result.current[0]).toBe("idle");
    },
  );

  it("supports the converter's shorter timeout and nullable idle value", async () => {
    const { result } = renderHook(() =>
      useTransientState<string | null>(null, 1800),
    );
    act(() => result.current[1]("fahrenheit"));
    await act(() => vi.advanceTimersByTimeAsync(1799));
    expect(result.current[0]).toBe("fahrenheit");
    await act(() => vi.advanceTimersByTimeAsync(1));
    expect(result.current[0]).toBeNull();
  });

  it("cancels the notification timer on unmount", () => {
    const { result, unmount } = renderHook(() => useTransientState("idle"));
    act(() => result.current[1]("copied"));
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
