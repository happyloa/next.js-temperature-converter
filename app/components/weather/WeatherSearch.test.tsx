import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { WeatherSearch } from "./WeatherSearch";

const makeProps = () => ({
  query: "Tokyo",
  onQueryChange: vi.fn(),
  onSubmit: vi.fn(),
  onPreset: vi.fn(),
  onGeolocate: vi.fn(),
  geolocating: false,
  loading: false,
  suggestions: [
    { name: "Tokyo", latitude: 35.68, longitude: 139.76 },
    { name: "Osaka", latitude: 34.69, longitude: 135.5 },
  ],
  suggestionsLoading: false,
  suggestionsOpen: true,
  setSuggestionsOpen: vi.fn(),
  onSuggestionSelect: vi.fn(),
});

describe("WeatherSearch keyboard interaction", () => {
  it.each([{ isComposing: true }, { keyCode: 229 }])(
    "does not select a suggestion while confirming IME input (%j)",
    (composition) => {
      const props = makeProps();
      render(<WeatherSearch {...props} />);
      const input = screen.getByRole("combobox", { name: "搜尋全球城市" });
      fireEvent.keyDown(input, { key: "ArrowDown" });
      fireEvent.keyDown(input, { key: "Enter", ...composition });

      expect(props.onSuggestionSelect).not.toHaveBeenCalled();

      fireEvent.keyDown(input, { key: "Enter", isComposing: false });
      expect(props.onSuggestionSelect).toHaveBeenCalledWith(
        props.suggestions[0],
      );
    },
  );

  it("does not reference or select an option removed from the results", () => {
    const props = makeProps();
    const { rerender } = render(<WeatherSearch {...props} />);
    const input = screen.getByRole("combobox", { name: "搜尋全球城市" });
    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(input.getAttribute("aria-activedescendant")).toBe(
      "weather-suggestion-1",
    );

    rerender(
      <WeatherSearch {...props} suggestions={props.suggestions.slice(0, 1)} />,
    );
    expect(input.hasAttribute("aria-activedescendant")).toBe(false);
    fireEvent.keyDown(input, { key: "Enter" });
    expect(props.onSuggestionSelect).not.toHaveBeenCalled();
  });
});
