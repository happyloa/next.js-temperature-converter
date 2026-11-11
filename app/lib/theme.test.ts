import { afterEach, describe, expect, it, vi } from "vitest";
import {
  THEME_INIT_SCRIPT,
  THEME_STORAGE_KEY,
  applyTheme,
  readStoredTheme,
  resolveTheme,
} from "./theme";

const mockSystemDark = (matches: boolean) => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockReturnValue({ matches } as MediaQueryList),
  );
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.documentElement.removeAttribute("data-theme");
});

describe("theme preference", () => {
  it("only treats valid stored values as an explicit choice", () => {
    expect(readStoredTheme()).toBeNull();
    localStorage.setItem(THEME_STORAGE_KEY, "sepia");
    expect(readStoredTheme()).toBeNull();
    localStorage.setItem(THEME_STORAGE_KEY, "light");
    expect(readStoredTheme()).toBe("light");
  });

  it("treats unavailable storage as no explicit choice", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("Blocked", "SecurityError");
    });
    expect(readStoredTheme()).toBeNull();
  });

  it("prefers the stored choice over the system setting", () => {
    mockSystemDark(true);
    expect(resolveTheme()).toBe("dark");
    localStorage.setItem(THEME_STORAGE_KEY, "light");
    expect(resolveTheme()).toBe("light");
  });

  it("applies the theme to the document element", () => {
    applyTheme("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  it.each([
    { stored: null, systemDark: true, expected: "dark" },
    { stored: null, systemDark: false, expected: "light" },
    { stored: "light", systemDark: true, expected: "light" },
    { stored: "invalid", systemDark: false, expected: "light" },
  ])(
    "pre-paint script matches resolveTheme (%o)",
    ({ stored, systemDark, expected }) => {
      mockSystemDark(systemDark);
      if (stored) localStorage.setItem(THEME_STORAGE_KEY, stored);

      new Function(THEME_INIT_SCRIPT)();

      expect(document.documentElement.dataset.theme).toBe(expected);
      expect(resolveTheme()).toBe(expected);
    },
  );
});
