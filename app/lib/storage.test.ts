import { afterEach, describe, expect, it, vi } from "vitest";

import { readWithFallback, writeWithFallback } from "./storage";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("storage fallback", () => {
  it("falls back to sessionStorage when localStorage is full", () => {
    const originalSetItem = Storage.prototype.setItem;
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (
      this: Storage,
      key,
      value,
    ) {
      if (this === window.localStorage) {
        throw new DOMException("Storage is full", "QuotaExceededError");
      }
      return originalSetItem.call(this, key, value);
    });

    expect(writeWithFallback("sample", '{"ok":true}', "local")).toBe("session");
    expect(sessionStorage.getItem("sample")).toBe('{"ok":true}');
  });

  it("removes a stale copy from the alternate storage", () => {
    localStorage.setItem("sample", "stale");

    expect(writeWithFallback("sample", "fresh", "session")).toBe("session");
    expect(sessionStorage.getItem("sample")).toBe("fresh");
    expect(localStorage.getItem("sample")).toBeNull();
  });

  it("continues reading after malformed local data", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    localStorage.setItem("sample", "not-json");
    sessionStorage.setItem("sample", '{"name":"valid"}');

    const result = readWithFallback("sample", (value) => {
      if (
        value &&
        typeof value === "object" &&
        "name" in value &&
        typeof value.name === "string"
      ) {
        return value.name;
      }
      return null;
    });

    expect(result).toEqual({ name: "session", data: "valid" });
  });

  it("can prefer session storage for session-scoped data", () => {
    localStorage.setItem("sample", '{"name":"persistent"}');
    sessionStorage.setItem("sample", '{"name":"session"}');

    const result = readWithFallback(
      "sample",
      (value) =>
        value &&
        typeof value === "object" &&
        "name" in value &&
        typeof value.name === "string"
          ? value.name
          : null,
      "session",
    );

    expect(result).toEqual({ name: "session", data: "session" });
  });

  it("does not persist session-scoped data to localStorage when session storage fails", () => {
    const originalSetItem = Storage.prototype.setItem;
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (
      this: Storage,
      key,
      value,
    ) {
      if (this === window.sessionStorage) {
        throw new DOMException("Storage is full", "QuotaExceededError");
      }
      return originalSetItem.call(this, key, value);
    });

    expect(
      writeWithFallback("sample", "sensitive", "session", {
        allowFallback: false,
      }),
    ).toBeNull();
    expect(localStorage.getItem("sample")).toBeNull();
  });

  it("clears both storage locations", () => {
    localStorage.setItem("sample", "local");
    sessionStorage.setItem("sample", "session");

    expect(writeWithFallback("sample", null, "local")).toBe("local");
    expect(localStorage.getItem("sample")).toBeNull();
    expect(sessionStorage.getItem("sample")).toBeNull();
  });
});
