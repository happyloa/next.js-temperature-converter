import { ui } from "../lib/uiStyles";
import { cn, handleRadioGroupKeyDown } from "../lib/utils";

type SegmentedOption<T> = { value: T; label: string; title?: string };

/** 以 roving tabindex 實作的分段單選按鈕組。 */
export function SegmentedControl<T extends string | number>({
  label,
  options,
  value,
  onChange,
  disabled,
}: {
  label: string;
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={ui.rangeControl}
      onKeyDown={(event) =>
        handleRadioGroupKeyDown(
          event,
          options.map((option) => option.value),
          value,
          onChange,
        )
      }
    >
      {options.map((option) => {
        const checked = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={checked}
            data-radio-value={option.value}
            tabIndex={checked ? 0 : -1}
            title={option.title}
            onClick={() => onChange(option.value)}
            disabled={disabled}
            className={cn(
              ui.rangeButton,
              checked
                ? ui.rangeButtonActive
                : "bg-surface-strong text-ink-subtle",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
