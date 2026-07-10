import type { KeyboardEvent } from "react";
import { describe, expect, it, vi } from "vitest";

import { cn, handleRadioGroupKeyDown } from "./utils";

describe("UI utilities", () => {
  it("merges conditional classes and resolves Tailwind conflicts", () => {
    expect(cn("px-2", false && "hidden", "px-4")).toBe("px-4");
  });

  it("moves radio selection and focus with arrow keys", () => {
    const group = document.createElement("div");
    const first = document.createElement("button");
    const second = document.createElement("button");
    first.dataset.radioValue = "daily";
    second.dataset.radioValue = "science";
    group.append(first, second);
    document.body.appendChild(group);
    first.focus();

    const onChange = vi.fn();
    const preventDefault = vi.fn();
    handleRadioGroupKeyDown(
      {
        key: "ArrowRight",
        currentTarget: group,
        preventDefault,
      } as unknown as KeyboardEvent<HTMLElement>,
      ["daily", "science"],
      "daily",
      onChange,
    );

    expect(preventDefault).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith("science");
    expect(document.activeElement).toBe(second);
    group.remove();
  });

  it("ignores unrelated keys", () => {
    const onChange = vi.fn();
    handleRadioGroupKeyDown(
      {
        key: "Enter",
        currentTarget: document.createElement("div"),
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent<HTMLElement>,
      [7, 14],
      7,
      onChange,
    );

    expect(onChange).not.toHaveBeenCalled();
  });
});
