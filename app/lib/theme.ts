export type Theme = "dark" | "light";

export const THEME_STORAGE_KEY = "theme-preference";
const DARK_SCHEME_QUERY = "(prefers-color-scheme: dark)";

/** 回傳使用者明確選擇的主題；null 代表跟隨系統設定。 */
export const readStoredTheme = (): Theme | null => {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored === "dark" || stored === "light" ? stored : null;
  } catch {
    return null;
  }
};

export const getSystemThemeQuery = (): MediaQueryList =>
  window.matchMedia(DARK_SCHEME_QUERY);

export const resolveTheme = (): Theme =>
  readStoredTheme() ?? (getSystemThemeQuery().matches ? "dark" : "light");

export const applyTheme = (theme: Theme) => {
  document.documentElement.setAttribute("data-theme", theme);
};

/** 在首次繪製前套用主題，邏輯需與 resolveTheme 一致。 */
export const THEME_INIT_SCRIPT = `(function(){try{var s=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});var t=s==="dark"||s==="light"?s:(window.matchMedia(${JSON.stringify(DARK_SCHEME_QUERY)}).matches?"dark":"light");document.documentElement.setAttribute("data-theme",t);}catch(e){}})();`;
