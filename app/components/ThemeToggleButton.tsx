"use client";

import { useTheme } from "./ThemeProvider";
import { Moon, Sun } from "lucide-react";

/**
 * 導覽列內的主題切換按鈕。
 */
export function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();
  const label = theme === "dark" ? "切換為淺色主題" : "切換為深色主題";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      className="icon-button"
      title={label}
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4" aria-hidden />
      ) : (
        <Moon className="h-4 w-4" aria-hidden />
      )}
    </button>
  );
}
