import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { copyText } from "../lib/clipboard";
import { ShareButton } from "./ShareButton";

vi.mock("../lib/clipboard", () => ({ copyText: vi.fn() }));

const originalShare = Object.getOwnPropertyDescriptor(navigator, "share");
const nativeShare = vi.fn();

beforeEach(() => {
  nativeShare.mockReset().mockResolvedValue(undefined);
  vi.mocked(copyText).mockReset().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "share", {
    configurable: true,
    value: nativeShare,
  });
});

afterEach(() => {
  if (originalShare) Object.defineProperty(navigator, "share", originalShare);
  else Reflect.deleteProperty(navigator, "share");
});

const share = () => {
  render(
    <ShareButton title="Temperature" text="25 °C" url="https://example.com/" />,
  );
  fireEvent.click(screen.getByRole("button", { name: "分享轉換結果" }));
};

describe("ShareButton", () => {
  it("uses native sharing without also copying", async () => {
    share();
    await waitFor(() => expect(nativeShare).toHaveBeenCalledOnce());
    expect(copyText).not.toHaveBeenCalled();
  });

  it("does not copy when native sharing is cancelled", async () => {
    nativeShare.mockRejectedValue(new DOMException("Cancelled", "AbortError"));
    share();
    await waitFor(() => expect(nativeShare).toHaveBeenCalledOnce());
    expect(copyText).not.toHaveBeenCalled();
    expect(screen.getByText("分享")).toBeTruthy();
  });

  it("copies once when native sharing fails", async () => {
    nativeShare.mockRejectedValue(new Error("unavailable"));
    share();
    await waitFor(() => expect(screen.getByText("已複製")).toBeTruthy());
    expect(copyText).toHaveBeenCalledExactlyOnceWith(
      "Temperature\n\n25 °C\n\nhttps://example.com/",
    );
  });

  it("reports a failed clipboard fallback without repeating it", async () => {
    Object.defineProperty(navigator, "share", { value: undefined });
    vi.mocked(copyText).mockRejectedValue(new Error("denied"));
    share();
    await waitFor(() => expect(screen.getByText("失敗")).toBeTruthy());
    expect(copyText).toHaveBeenCalledOnce();
  });
});
