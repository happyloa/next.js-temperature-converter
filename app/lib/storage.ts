export type StorageName = "local" | "session";

type NamedStorage = { name: StorageName; storage: Storage };

const getStorage = (name: StorageName): NamedStorage | null => {
  try {
    return {
      name,
      storage: name === "local" ? window.localStorage : window.sessionStorage,
    };
  } catch {
    return null;
  }
};

const getStorages = (): NamedStorage[] =>
  ([getStorage("local"), getStorage("session")] as const).filter(
    (item): item is NamedStorage => item !== null,
  );

const withPreferred = (preferred: StorageName): NamedStorage[] => {
  return getStorages().sort((item) => (item.name === preferred ? -1 : 1));
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

  const storages = withPreferred(preferred);

  if (payload === null) {
    let succeededWith: StorageName | null = null;
    for (const { name, storage } of storages) {
      try {
        storage.removeItem(key);
        succeededWith ??= name;
      } catch (error) {
        console.error(`Failed to clear ${key} from ${name}Storage`, error);
      }
    }
    return succeededWith;
  }

  for (const { name, storage } of storages) {
    try {
      storage.setItem(key, payload);

      for (const alternative of storages) {
        if (alternative.name === name) continue;
        try {
          alternative.storage.removeItem(key);
        } catch {
          // The successful storage remains authoritative even if cleanup fails.
        }
      }
      return name;
    } catch (error) {
      if (!isQuotaExceededError(error)) {
        console.error(`Failed to persist ${key} in ${name}Storage`, error);
      }
    }
  }

  return null;
}
