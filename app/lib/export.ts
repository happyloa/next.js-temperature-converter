import type { HistoryEntry } from "../types/history";
import { TEMPERATURE_SCALES } from "./temperature";

const escapeCsvCell = (value: string | number): string => {
  const normalized = `${value}`;
  return /[",\r\n]/.test(normalized)
    ? `"${normalized.replaceAll('"', '""')}"`
    : normalized;
};

export function historyToCsv(history: HistoryEntry[]): string {
  if (history.length === 0) return "";

  const headers = ["時間", ...TEMPERATURE_SCALES.map((item) => item.label)];
  const rows = history.map((entry) => {
    const values = TEMPERATURE_SCALES.map((column) => {
      const conversion = entry.conversions.find(
        (item) => item.code === column.code,
      );
      return conversion && Number.isFinite(conversion.result)
        ? `${conversion.result}`
        : "";
    });

    return [new Date(entry.timestamp).toLocaleString("zh-TW"), ...values]
      .map(escapeCsvCell)
      .join(",");
  });

  return [headers.map(escapeCsvCell).join(","), ...rows].join("\n");
}
