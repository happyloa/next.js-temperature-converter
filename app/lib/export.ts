import type { HistoryEntry } from "../types/history";
import type { TemperatureScaleCode } from "../types/temperature";

const CSV_COLUMNS: Array<{ code: TemperatureScaleCode; label: string }> = [
  { code: "celsius", label: "攝氏 (°C)" },
  { code: "fahrenheit", label: "華氏 (°F)" },
  { code: "kelvin", label: "絕對溫標 (K)" },
  { code: "rankine", label: "蘭氏 (°R)" },
  { code: "reaumur", label: "列氏 (°Ré)" },
  { code: "newton", label: "牛頓氏 (°N)" },
];

const escapeCsvCell = (value: string | number): string => {
  const normalized = `${value}`;
  return /[",\r\n]/.test(normalized)
    ? `"${normalized.replaceAll('"', '""')}"`
    : normalized;
};

export function historyToCsv(history: HistoryEntry[]): string {
  if (history.length === 0) return "";

  const headers = ["時間", ...CSV_COLUMNS.map((item) => item.label)];
  const rows = history.map((entry) => {
    const values = CSV_COLUMNS.map((column) => {
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
