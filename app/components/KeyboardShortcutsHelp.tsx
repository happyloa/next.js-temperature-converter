"use client";

import type { FC } from "react";
import { useEffect, useId, useRef } from "react";

interface ShortcutInfo {
  keys: string;
  description: string;
}

interface KeyboardShortcutsHelpProps {
  shortcuts: ShortcutInfo[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * 鍵盤快捷鍵說明面板。觸發按鈕永遠可見，`isOpen` 由外部（? / Escape 快捷鍵）
 * 或按鈕本身共同控制，確保使用者一定找得到這個功能的入口。
 */
export const KeyboardShortcutsHelp: FC<KeyboardShortcutsHelpProps> = ({
  shortcuts,
  isOpen,
  onOpenChange,
}) => {
  const headingId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
      wasOpenRef.current = true;
    } else if (wasOpenRef.current) {
      wasOpenRef.current = false;
      triggerRef.current?.focus();
    }
  }, [isOpen]);

  const handleDialogKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab" || !dialogRef.current) return;

    const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <>
      {/* Help button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => onOpenChange(true)}
        className="bg-surface-strong text-ink-medium hover:text-ink-strong hover:bg-surface-soft fixed bottom-20 right-4 z-40 flex h-10 w-10 items-center justify-center rounded-full shadow-lg backdrop-blur transition-all"
        aria-label="鍵盤快捷鍵"
        title="鍵盤快捷鍵 (?)"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M2.25 5.25a3 3 0 013-3h13.5a3 3 0 013 3V15a3 3 0 01-3 3h-3v.257c0 .597.237 1.17.659 1.591l.621.622a.75.75 0 01-.53 1.28h-9a.75.75 0 01-.53-1.28l.621-.622a2.25 2.25 0 00.659-1.59V18h-3a3 3 0 01-3-3V5.25zm1.5 0v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => onOpenChange(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby={headingId}
        >
          <div
            ref={dialogRef}
            className="border-edge-subtle bg-surface-strong mx-4 max-w-md rounded-2xl border p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleDialogKeyDown}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3
                id={headingId}
                className="text-ink-strong text-lg font-semibold"
              >
                鍵盤快捷鍵
              </h3>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => onOpenChange(false)}
                className="text-ink-subtle hover:text-ink-strong hover:bg-surface-soft rounded-lg p-1 transition-colors"
                aria-label="關閉"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            <dl className="space-y-3">
              {shortcuts.map((shortcut, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-4 text-sm"
                >
                  <dt className="text-ink-medium">{shortcut.description}</dt>
                  <dd>
                    <kbd className="bg-surface-soft text-ink-medium rounded-lg px-2 py-1 font-mono text-xs">
                      {shortcut.keys}
                    </kbd>
                  </dd>
                </div>
              ))}
            </dl>

            <p className="text-ink-subtle mt-4 text-xs">
              按 Escape 或點擊外部關閉
            </p>
          </div>
        </div>
      )}
    </>
  );
};
