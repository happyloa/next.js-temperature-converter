"use client";

import { startTransition, useEffect, useRef, useState } from "react";

import { searchLocations } from "../lib/weatherApi";
import type { GeoApiLocation } from "../lib/weatherApi";

const SUGGESTION_DELAY_MS = 350;

export function useWeatherSuggestions(query: string, committedQuery: string) {
  const [suggestions, setSuggestions] = useState<GeoApiLocation[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const trimmed = query.trim();
    controllerRef.current?.abort();

    if (trimmed.length < 2 || trimmed === committedQuery) {
      startTransition(() => {
        setSuggestions([]);
        setSuggestionsLoading(false);
        setSuggestionsOpen(false);
      });
      return;
    }

    const timer = window.setTimeout(async () => {
      const controller = new AbortController();
      controllerRef.current = controller;
      setSuggestionsLoading(true);

      try {
        const result = await searchLocations(trimmed, 5, controller.signal);
        setSuggestions(result);
        setSuggestionsOpen(true);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          console.error("searchLocations", error);
        }
      } finally {
        if (controllerRef.current === controller) {
          setSuggestionsLoading(false);
        }
      }
    }, SUGGESTION_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [committedQuery, query]);

  useEffect(() => () => controllerRef.current?.abort(), []);

  return {
    suggestions,
    suggestionsLoading,
    suggestionsOpen,
    setSuggestionsOpen,
  };
}
