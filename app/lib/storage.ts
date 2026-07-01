export type StorageName = "local" | "session";

type NamedStorage = { name: StorageName; storage: Storage };

const getStorages = (): NamedStorage[] => [
  { name: "local", storage: window.localStorage },
  { name: "session", storage: window.sessionStorage },
];

const withPreferred = (preferred: StorageName): NamedStorage[] => {
  const [first, second] = getStorages();
  return preferred === "session" ? [second, first] : [first, second];
};

const isQuotaExceededError = (error: unknown): boolean => {
  if (!error) return false;
  if (error instanceof DOMException) {
    return (
      error.name === "QuotaExceededError" ||
      error.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
      error.code === 22 ||
      error.code === 1014
    );
  }
  return false;
};

/**
 * 依序嘗試 localStorage/sessionStorage 讀取並解析資料，回傳第一筆成功結果。
 */
export function readWithFallback<T>(
  key: string,
  parse: (raw: unknown) => T | null,
): { name: StorageName; data: T } | null {
  if (typeof window === "undefined") return null;

  for (const { name, storage } of getStorages()) {
    try {
      const raw = storage.getItem(key);
      if (!raw) continue;

      const data = parse(JSON.parse(raw) as unknown);
      if (data !== null) {
        return { name, data };
      }
    } catch (error) {
      console.error(`Failed to restore ${key}`, error);
    }
  }

  return null;
}

/**
 * 依優先順序寫入 storage，遇到容量不足時自動改用下一個 storage。
 */
export function writeWithFallback(
  key: string,
  payload: string | null,
  preferred: StorageName,
): StorageName | null {
  if (typeof window === "undefined") return null;

  for (const { name, storage } of withPreferred(preferred)) {
    try {
      if (payload === null) {
        storage.removeItem(key);
      } else {
        storage.setItem(key, payload);
      }
      return name;
    } catch (error) {
      if (isQuotaExceededError(error)) {
        continue;
      }
      console.error(`Failed to persist ${key}`, error);
      return null;
    }
  }

  return null;
}
