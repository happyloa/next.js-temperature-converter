import type { KeyboardEvent } from "react";

type ClassName = string | false | null | undefined;

/**
 * 合併元件使用的靜態與條件 class name。
 */
export function cn(...inputs: ClassName[]): string {
  return inputs.filter((value): value is string => Boolean(value)).join(" ");
}

/**
 * 實作 role="radiogroup" 的方向鍵瀏覽（roving tabindex），
 * 讓每個選項可用方向鍵切換並自動聚焦到新選中的按鈕。
 * 按鈕需標上 data-radio-value 屬性以利定位。
 */
export function handleRadioGroupKeyDown<T extends string | number>(
  event: KeyboardEvent<HTMLElement>,
  items: T[],
  activeValue: T,
  onChange: (value: T) => void,
) {
  let delta = 0;
  if (event.key === "ArrowRight" || event.key === "ArrowDown") delta = 1;
  else if (event.key === "ArrowLeft" || event.key === "ArrowUp") delta = -1;
  else return;

  event.preventDefault();
  const currentIndex = items.indexOf(activeValue);
  const nextIndex = (currentIndex + delta + items.length) % items.length;
  const nextValue = items[nextIndex];
  onChange(nextValue);

  event.currentTarget
    .querySelector<HTMLElement>(`[data-radio-value="${nextValue}"]`)
    ?.focus();
}
