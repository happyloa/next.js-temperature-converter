import type {
  HistoryEntry,
  TemperatureConversionSummary,
} from "../types/history";
import { TEMPERATURE_SCALE_CODES } from "./temperature";

/**
 * localStorage 與 sessionStorage 共用的儲存鍵。
 */
export const HISTORY_STORAGE_KEY = "temperature-studio-history";

const isTemperatureConversionSummary = (
  value: unknown,
): value is TemperatureConversionSummary => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Partial<TemperatureConversionSummary>;
  return (
    typeof candidate.label === "string" &&
    typeof candidate.symbol === "string" &&
    typeof candidate.result === "number" &&
    typeof candidate.code === "string" &&
    TEMPERATURE_SCALE_CODES.includes(candidate.code as never)
  );
};

const isHistoryEntry = (value: unknown): value is HistoryEntry => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Partial<HistoryEntry>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.timestamp === "string" &&
    typeof candidate.scale === "string" &&
    TEMPERATURE_SCALE_CODES.includes(candidate.scale as never) &&
    typeof candidate.scaleLabel === "string" &&
    typeof candidate.scaleSymbol === "string" &&
    typeof candidate.value === "number" &&
    Array.isArray(candidate.conversions) &&
    candidate.conversions.every(isTemperatureConversionSummary)
  );
};

/**
 * 將儲存內容轉回型別安全的歷史紀錄陣列。
 */
export const parseHistoryPayload = (value: unknown): HistoryEntry[] | null => {
  if (!Array.isArray(value)) {
    return null;
  }

  return value.filter(isHistoryEntry);
};
