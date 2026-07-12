"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { isAbortError } from "../lib/async";
import { searchLocations } from "../lib/weatherApi";
import type { GeoApiLocation } from "../lib/weatherApi";

const SUGGESTION_DELAY_MS = 350;

type SuggestionState = {
  query: string;
  items: GeoApiLocation[];
  loading: boolean;
};

export function useWeatherSuggestions(
  query: string,
  committedQuery: string,
  enabled: boolean,
) {
  const [state, setState] = useState<SuggestionState>({
    query: "",
    items: [],
    loading: false,
  });
  const [openRequested, setOpenRequested] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);
  const shouldOpenRef = useRef(false);
  const trimmed = query.trim();
  const canSearch =
    enabled && trimmed.length >= 2 && trimmed !== committedQuery;
  const suggestions = canSearch && state.query === trimmed ? state.items : [];
  const suggestionsLoading =
    canSearch && state.query === trimmed && state.loading;
  const suggestionsOpen = openRequested && suggestions.length > 0 && canSearch;

  const setSuggestionsOpen = useCallback((open: boolean) => {
    shouldOpenRef.current = open;
    setOpenRequested(open);
  }, []);

  useEffect(() => {
    controllerRef.current?.abort();

    if (!canSearch) {
      shouldOpenRef.current = false;
      return;
    }

    shouldOpenRef.current = true;
    const timer = window.setTimeout(async () => {
      const controller = new AbortController();
      controllerRef.current = controller;
      setState({ query: trimmed, items: [], loading: true });

      try {
        const result = await searchLocations(trimmed, 5, controller.signal);
        setState({ query: trimmed, items: result, loading: false });
        setOpenRequested(shouldOpenRef.current && result.length > 0);
      } catch (error) {
        if (!isAbortError(error)) {
          console.error("searchLocations", error);
          setState({ query: trimmed, items: [], loading: false });
          setOpenRequested(false);
        }
      }
    }, SUGGESTION_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [canSearch, trimmed]);

  useEffect(
    () => () => {
      shouldOpenRef.current = false;
      controllerRef.current?.abort();
    },
    [],
  );

  return {
    suggestions,
    suggestionsLoading,
    suggestionsOpen,
    setSuggestionsOpen,
  };
}
