"use client";

import { useTheme } from "./ThemeProvider";

/**
 * 固定在畫面右下角的主題切換按鈕。
 */
export function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();
  const label = theme === "dark" ? "切換為淺色主題" : "切換為深色主題";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      aria-pressed={theme === "light"}
      className={`focus-visible:outline-accent fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition focus-visible:outline-2 focus-visible:outline-offset-2 ${
        theme === "dark"
          ? "bg-slate-800 text-slate-100 hover:bg-slate-700"
          : "bg-accent text-accent-ink hover:bg-accent-hover"
      }`}
      title={label}
    >
      <span className="text-2xl" role="img" aria-hidden="true">
        {theme === "dark" ? "🌙" : "☀️"}
      </span>
    </button>
  );
}
