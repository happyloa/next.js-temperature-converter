"use client";

import {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  THEME_STORAGE_KEY,
  applyTheme,
  getSystemThemeQuery,
  readStoredTheme,
  resolveTheme,
  type Theme,
} from "../lib/theme";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    const initialTheme = resolveTheme();
    applyTheme(initialTheme);
    document.documentElement.dataset.hydrated = "true";
    startTransition(() => setThemeState(initialTheme));

    // Until the user picks a theme, keep following OS-level changes.
    const media = getSystemThemeQuery();
    const handleSystemChange = (event: MediaQueryListEvent) => {
      if (readStoredTheme()) return;
      const systemTheme: Theme = event.matches ? "dark" : "light";
      applyTheme(systemTheme);
      setThemeState(systemTheme);
    };
    media.addEventListener("change", handleSystemChange);
    return () => media.removeEventListener("change", handleSystemChange);
  }, []);

  const toggleTheme = useCallback(() => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
    setThemeState(nextTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // The selected theme still applies for the current session.
    }
  }, [theme]);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return <ThemeContext value={value}>{children}</ThemeContext>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
