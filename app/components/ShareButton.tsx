"use client";

import type { FC } from "react";
import { useCallback, useState } from "react";
import { cn } from "../lib/utils";

interface ShareButtonProps {
  title: string;
  text: string;
  url?: string;
  className?: string;
}

/**
 * 分享按鈕組件。
 * 使用 Web Share API，若不支援則降級使用剪貼簿複製。
 */
export const ShareButton: FC<ShareButtonProps> = ({
  title,
  text,
  url,
  className = "",
}) => {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isShareSupported =
    typeof navigator !== "undefined" && !!navigator.share;

  const handleShare = useCallback(async () => {
    const shareUrl =
      url || (typeof window !== "undefined" ? window.location.href : "");
    const shareData = {
      title,
      text,
      url: shareUrl,
    };

    try {
      if (isShareSupported) {
        await navigator.share(shareData);
      } else {
        // 若不支援 Web Share API，則降級使用剪貼簿複製
        const shareText = `${title}\n\n${text}\n\n${shareUrl}`;
        await navigator.clipboard?.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
      setError(null);
    } catch (err) {
      // 使用者取消分享不視為錯誤
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }

      // 再次嘗試降級使用剪貼簿
      try {
        const shareText = `${title}\n\n${text}\n\n${shareUrl}`;
        await navigator.clipboard?.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        setError(null);
      } catch {
        setError("分享失敗");
        setTimeout(() => setError(null), 2000);
      }
    }
  }, [title, text, url, isShareSupported]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleShare}
        className={cn(
          "group flex items-center gap-2 rounded-xl px-4 py-2.5 transition-all duration-200",
          copied
            ? "theme-status-success"
            : error
              ? "theme-status-error"
              : "bg-surface-light text-ink-medium hover:bg-surface-soft hover:text-ink-strong",
          className,
        )}
        aria-label="分享"
      >
        {copied ? (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-medium">已複製</span>
          </>
        ) : error ? (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-medium">{error}</span>
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M15.75 4.5a3 3 0 11.825 2.066l-8.421 4.679a3.002 3.002 0 010 1.51l8.421 4.679a3 3 0 11-.729 1.31l-8.421-4.678a3 3 0 110-4.132l8.421-4.679a3 3 0 01-.096-.755z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-medium">分享</span>
          </>
        )}
      </button>
    </div>
  );
};
