"use client";

import type { FormEvent, KeyboardEvent } from "react";
import { useState } from "react";
import { LoaderCircle, LocateFixed, Search } from "lucide-react";

import { cn } from "../../lib/utils";
import { ui } from "../../lib/uiStyles";
import { WEATHER_PRESETS } from "../../lib/weather";
import type { GeoApiLocation } from "../../lib/weatherApi";

type WeatherSearchProps = {
  query: string;
  onQueryChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onPreset: (query: string) => void;
  onGeolocate: () => void;
  geolocating: boolean;
  loading: boolean;
  suggestions: GeoApiLocation[];
  suggestionsLoading: boolean;
  suggestionsOpen: boolean;
  setSuggestionsOpen: (open: boolean) => void;
  onSuggestionSelect: (location: GeoApiLocation) => void;
};

export function WeatherSearch({
  query,
  onQueryChange,
  onSubmit,
  onPreset,
  onGeolocate,
  geolocating,
  loading,
  suggestions,
  suggestionsLoading,
  suggestionsOpen,
  setSuggestionsOpen,
  onSuggestionSelect,
}: WeatherSearchProps) {
  const featured = WEATHER_PRESETS.slice(0, 6);
  const more = WEATHER_PRESETS.slice(6);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const closeSuggestions = () => {
    setSuggestionsOpen(false);
    setActiveSuggestion(-1);
  };

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!suggestions.length) return;

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setSuggestionsOpen(true);
      setActiveSuggestion((current) => {
        const direction = event.key === "ArrowDown" ? 1 : -1;
        return (current + direction + suggestions.length) % suggestions.length;
      });
      return;
    }

    if (event.key === "Enter" && suggestionsOpen && activeSuggestion >= 0) {
      event.preventDefault();
      onSuggestionSelect(suggestions[activeSuggestion]);
      closeSuggestions();
      return;
    }

    if (event.key === "Escape") {
      closeSuggestions();
    }
  };

  return (
    <div className="min-w-0">
      <form
        onSubmit={onSubmit}
        className="relative grid min-w-0 grid-cols-[1.25rem_minmax(0,1fr)_auto_auto] items-center gap-1.5 rounded-lg border border-edge-strong bg-surface-strong p-1.5 focus-within:border-accent"
        role="search"
      >
        <label htmlFor="weather-search" className="sr-only">
          搜尋全球城市
        </label>
        <Search className="ml-1.5 h-4 w-4 text-ink-subtle" aria-hidden />
        <input
          id="weather-search"
          type="search"
          value={query}
          onChange={(event) => {
            setActiveSuggestion(-1);
            onQueryChange(event.target.value);
          }}
          onFocus={() => suggestions.length && setSuggestionsOpen(true)}
          onBlur={closeSuggestions}
          onKeyDown={handleSearchKeyDown}
          autoComplete="off"
          placeholder="輸入城市，例如 Taipei"
          role="combobox"
          aria-autocomplete="list"
          aria-haspopup="listbox"
          aria-expanded={suggestionsOpen}
          aria-controls="weather-suggestions"
          aria-activedescendant={
            suggestionsOpen && activeSuggestion >= 0
              ? `weather-suggestion-${activeSuggestion}`
              : undefined
          }
          className="w-full min-w-0 border-0 bg-transparent px-1 py-2 text-sm text-ink-strong outline-0"
        />
        {suggestionsLoading ? (
          <LoaderCircle
            className="h-4 w-4 animate-spin text-ink-subtle"
            aria-hidden
          />
        ) : null}
        <button
          type="button"
          onClick={onGeolocate}
          disabled={geolocating || loading}
          className={ui.iconButton}
          aria-label="使用目前位置"
          title="使用目前位置"
        >
          {geolocating ? (
            <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <LocateFixed className="h-4 w-4" aria-hidden />
          )}
        </button>
        <button
          type="submit"
          disabled={loading}
          className={cn(ui.button, ui.primaryButton)}
          aria-label="查詢天氣"
        >
          <Search className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">查詢</span>
        </button>

        {suggestionsOpen && suggestions.length ? (
          <ul
            id="weather-suggestions"
            role="listbox"
            className="absolute top-[calc(100%+0.35rem)] right-0 left-0 z-50 overflow-hidden rounded-lg border border-edge-subtle bg-surface-strong p-1.5 shadow-[var(--shadow)]"
          >
            {suggestions.map((location, index) => (
              <li
                id={`weather-suggestion-${index}`}
                key={location.id ?? `${location.name}-${location.latitude}`}
                role="option"
                aria-selected={activeSuggestion === index}
                className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-md px-2.5 py-2 text-[0.8125rem] text-ink-medium hover:bg-surface-soft hover:text-ink-strong aria-selected:bg-surface-soft aria-selected:text-ink-strong"
                onMouseEnter={() => setActiveSuggestion(index)}
                onMouseDown={(event) => {
                  event.preventDefault();
                  onSuggestionSelect(location);
                  closeSuggestions();
                }}
              >
                <strong className="text-ink-strong">{location.name}</strong>
                <span className="text-right text-xs text-ink-subtle">
                  {[location.admin1, location.country]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </form>

      <div
        className="mt-2.5 flex min-w-0 gap-2 overflow-x-auto px-0.5 pt-0.5 pb-1 [scrollbar-width:thin]"
        aria-label="常用城市"
      >
        {featured.map((preset) => (
          <button
            key={preset.query}
            type="button"
            onClick={() => onPreset(preset.query)}
            className={cn(
              "inline-flex min-h-9 shrink-0 items-center justify-center rounded-lg border bg-surface-strong px-3 py-2 text-xs font-semibold transition-colors hover:border-accent hover:text-ink-strong",
              query === preset.query || query === preset.label
                ? "border-accent text-ink-strong"
                : "border-edge-subtle text-ink-medium",
            )}
          >
            {preset.label}
          </button>
        ))}
        <label className="shrink-0">
          <span className="sr-only">更多常用城市</span>
          <select
            value=""
            onChange={(event) => {
              if (event.target.value) onPreset(event.target.value);
            }}
            className="min-h-9 rounded-lg border border-edge-subtle bg-surface-strong py-1.5 pr-7 pl-2.5 text-xs font-semibold text-ink-medium"
          >
            <option value="">更多城市</option>
            {more.map((preset) => (
              <option key={preset.query} value={preset.query}>
                {preset.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
