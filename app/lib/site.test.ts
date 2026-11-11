import { describe, expect, it } from "vitest";
import { resolveSiteUrl } from "./site";

describe("resolveSiteUrl", () => {
  it("falls back to the production URL when unset or blank", () => {
    expect(resolveSiteUrl(undefined)).toBe(
      "https://next-js-temperature-convert.vercel.app",
    );
    expect(resolveSiteUrl("   ")).toBe(
      "https://next-js-temperature-convert.vercel.app",
    );
  });

  it("trims whitespace and trailing slashes so paths can be appended", () => {
    expect(resolveSiteUrl(" https://example.com/ ")).toBe(
      "https://example.com",
    );
    expect(resolveSiteUrl("https://example.com//")).toBe("https://example.com");
  });
});
