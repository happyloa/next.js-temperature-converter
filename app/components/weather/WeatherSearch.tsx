"use client";

import type { FormEvent, KeyboardEvent } from "react";
import { useState } from "react";
import { LoaderCircle, LocateFixed, Search } from "lucide-react";

import { cn } from "../../lib/utils";
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
      setSuggestionsOpen(false);
      return;
    }

    if (event.key === "Escape") {
      setSuggestionsOpen(false);
    }
  };

  return (
    <div className="weather-search-block">
      <form onSubmit={onSubmit} className="weather-search-form" role="search">
        <label htmlFor="weather-search" className="sr-only">
          搜尋全球城市
        </label>
        <Search className="weather-search-icon" aria-hidden />
        <input
          id="weather-search"
          type="search"
          value={query}
          onChange={(event) => {
            setActiveSuggestion(-1);
            onQueryChange(event.target.value);
          }}
          onFocus={() => suggestions.length && setSuggestionsOpen(true)}
          onBlur={() => setSuggestionsOpen(false)}
          onKeyDown={handleSearchKeyDown}
          autoComplete="off"
          placeholder="輸入城市，例如 Taipei"
          role="combobox"
          aria-autocomplete="list"
          aria-haspopup="listbox"
          aria-expanded={suggestionsOpen}
          aria-controls="weather-suggestions"
          aria-activedescendant={
            activeSuggestion >= 0
              ? `weather-suggestion-${activeSuggestion}`
              : undefined
          }
          className="weather-search-input"
        />
        {suggestionsLoading ? (
          <LoaderCircle className="weather-search-loader" aria-hidden />
        ) : null}
        <button
          type="button"
          onClick={onGeolocate}
          disabled={geolocating || loading}
          className="icon-button"
          aria-label="使用目前位置"
          title="使用目前位置"
        >
          {geolocating ? (
            <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <LocateFixed className="h-4 w-4" aria-hidden />
          )}
        </button>
        <button type="submit" disabled={loading} className="primary-button">
          <Search className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">查詢</span>
        </button>

        {suggestionsOpen && suggestions.length ? (
          <ul
            id="weather-suggestions"
            role="listbox"
            className="suggestion-menu"
          >
            {suggestions.map((location, index) => (
              <li
                id={`weather-suggestion-${index}`}
                key={location.id ?? `${location.name}-${location.latitude}`}
                role="option"
                aria-selected={activeSuggestion === index}
                className="suggestion-option"
                onMouseEnter={() => setActiveSuggestion(index)}
                onMouseDown={(event) => {
                  event.preventDefault();
                  onSuggestionSelect(location);
                  setSuggestionsOpen(false);
                }}
              >
                <strong>{location.name}</strong>
                <span>
                  {[location.admin1, location.country]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </form>

      <div className="city-presets" aria-label="常用城市">
        {featured.map((preset) => (
          <button
            key={preset.query}
            type="button"
            onClick={() => onPreset(preset.query)}
            className={cn(
              "city-preset",
              (query === preset.query || query === preset.label) &&
                "city-preset--active",
            )}
          >
            {preset.label}
          </button>
        ))}
        <label className="more-city-select">
          <span className="sr-only">更多常用城市</span>
          <select
            value=""
            onChange={(event) => {
              if (event.target.value) onPreset(event.target.value);
            }}
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
