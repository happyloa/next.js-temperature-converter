import type {
  HistoryEntry,
  TemperatureConversionSummary,
} from "../types/history";
import { isDateString, isFiniteNumber, isRecord } from "./guards";
import { TEMPERATURE_SCALE_CODES } from "./temperature";

/**
 * localStorage 與 sessionStorage 共用的儲存鍵。
 */
export const HISTORY_STORAGE_KEY = "temperature-studio-history";

const isTemperatureConversionSummary = (
  value: unknown,
): value is TemperatureConversionSummary => {
  if (!isRecord(value)) return false;

  const candidate = value as Partial<TemperatureConversionSummary>;
  return (
    typeof candidate.label === "string" &&
    typeof candidate.symbol === "string" &&
    isFiniteNumber(candidate.result) &&
    typeof candidate.code === "string" &&
    TEMPERATURE_SCALE_CODES.includes(candidate.code as never)
  );
};

const isHistoryEntry = (value: unknown): value is HistoryEntry => {
  if (!isRecord(value)) return false;

  const candidate = value as Partial<HistoryEntry>;
  return (
    typeof candidate.id === "string" &&
    isDateString(candidate.timestamp) &&
    typeof candidate.scale === "string" &&
    TEMPERATURE_SCALE_CODES.includes(candidate.scale as never) &&
    typeof candidate.scaleLabel === "string" &&
    typeof candidate.scaleSymbol === "string" &&
    isFiniteNumber(candidate.value) &&
    Array.isArray(candidate.conversions) &&
    candidate.conversions.length > 0 &&
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
