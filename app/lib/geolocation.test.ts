import { describe, expect, it, vi } from "vitest";

import {
  getGeolocationErrorMessage,
  requestCurrentPosition,
} from "./geolocation";

describe("geolocation helpers", () => {
  it.each([
    [1, "位置存取權限被拒絕，請在瀏覽器設定中允許"],
    [2, "無法取得位置資訊"],
    [3, "取得位置逾時，請再試一次"],
    [undefined, "取得位置時發生錯誤"],
  ])("maps error code %s to a user-facing message", (code, message) => {
    expect(getGeolocationErrorMessage({ code })).toBe(message);
  });

  it("requests a high-accuracy position with a bounded cache age", async () => {
    const position = {
      coords: { latitude: 25, longitude: 121 },
    } as GeolocationPosition;
    const getCurrentPosition = vi.fn((resolve: PositionCallback) =>
      resolve(position),
    );

    await expect(
      requestCurrentPosition({ getCurrentPosition } as unknown as Geolocation),
    ).resolves.toBe(position);
    expect(getCurrentPosition).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      },
    );
  });
});
