import { afterEach, describe, expect, it, vi } from "vitest";

import { copyText } from "./clipboard";

const originalClipboard = Object.getOwnPropertyDescriptor(
  Navigator.prototype,
  "clipboard",
);

afterEach(() => {
  vi.restoreAllMocks();
  if (originalClipboard) {
    Object.defineProperty(Navigator.prototype, "clipboard", originalClipboard);
  } else {
    Reflect.deleteProperty(Navigator.prototype, "clipboard");
  }
  Reflect.deleteProperty(document, "execCommand");
});

describe("copyText", () => {
  it("uses the async Clipboard API when available", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(Navigator.prototype, "clipboard", {
      configurable: true,
      get: () => ({ writeText }),
    });

    await copyText("temperature");

    expect(writeText).toHaveBeenCalledWith("temperature");
  });

  it("falls back to execCommand and removes its temporary element", async () => {
    Object.defineProperty(Navigator.prototype, "clipboard", {
      configurable: true,
      get: () => undefined,
    });
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: vi.fn().mockReturnValue(true),
    });

    await copyText("fallback");

    expect(document.execCommand).toHaveBeenCalledWith("copy");
    expect(document.querySelector("textarea")).toBeNull();
  });

  it("cleans up and reports a failed fallback", async () => {
    Object.defineProperty(Navigator.prototype, "clipboard", {
      configurable: true,
      get: () => undefined,
    });
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: vi.fn().mockReturnValue(false),
    });

    await expect(copyText("fallback")).rejects.toThrow("Clipboard copy failed");
    expect(document.querySelector("textarea")).toBeNull();
  });
});
