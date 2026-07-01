/**
 * 專案統一的數值格式化工具，確保展示時的一致性。
 */
const numberFormatter = new Intl.NumberFormat("zh-TW", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

export const timeFormatter = new Intl.DateTimeFormat("zh-TW", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

/**
 * 將數值轉成輸入框可用的文字，避免出現科學記號。
 */
export const toInputString = (value: number): string => {
  if (!Number.isFinite(value)) return "";
  const trimmed = Number(value.toFixed(4));
  return `${trimmed}`;
};

/**
 * 受限於滑桿範圍時使用的夾擊函式。
 */
export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

export const formatTemperature = (value: number): string =>
  numberFormatter.format(value);

export const formatOptionalMetric = (value: number, suffix = ""): string => {
  if (!Number.isFinite(value)) {
    return suffix ? `--${suffix}` : "--";
  }
  return `${formatTemperature(value)}${suffix}`;
};

export const formatLocalClock = (
  value: string | null,
  timezone: string | null | undefined,
  { withSeconds = false }: { withSeconds?: boolean } = {},
): string => {
  if (!value) return "--";

  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    const formatter = new Intl.DateTimeFormat("zh-TW", {
      hour: "2-digit",
      minute: "2-digit",
      ...(withSeconds ? { second: "2-digit" } : {}),
      timeZone: timezone ?? "UTC",
    });

    return formatter.format(date);
  } catch (error) {
    console.error("formatLocalClock", error);
    return value ?? "--";
  }
};

export const formatUtcOffset = (value: string | null): string => {
  if (!value) return "UTC±00:00";
  const normalized = `${value}`.trim();
  if (/^[+-]\d{2}:\d{2}$/.test(normalized)) {
    return `UTC${normalized}`;
  }
  return `UTC${normalized}`;
};
