"use client";

import { Check, Share2, X } from "lucide-react";

import { useTransientState } from "../hooks/useTransientState";
import { isAbortError } from "../lib/async";
import { copyText } from "../lib/clipboard";
import { ui } from "../lib/uiStyles";
import { cn } from "../lib/utils";

export function ShareButton({
  title,
  text,
  url,
  className = "",
}: {
  title: string;
  text: string;
  url?: string;
  className?: string;
}) {
  const [status, flash] = useTransientState<"idle" | "copied" | "error">(
    "idle",
  );

  const handleShare = async () => {
    const shareUrl = url ?? window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: shareUrl });
        return;
      } catch (error) {
        if (isAbortError(error)) return;
      }
    }

    try {
      await copyText(`${title}\n\n${text}\n\n${shareUrl}`);
      flash("copied");
    } catch {
      flash("error");
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className={cn(
        ui.button,
        status === "copied"
          ? ui.successButton
          : status === "error"
            ? ui.dangerButton
            : ui.secondaryButton,
        className,
      )}
      aria-label="分享轉換結果"
    >
      {status === "copied" ? (
        <Check className="h-4 w-4" aria-hidden />
      ) : status === "error" ? (
        <X className="h-4 w-4" aria-hidden />
      ) : (
        <Share2 className="h-4 w-4" aria-hidden />
      )}
      <span aria-live="polite">
        {status === "copied" ? "已複製" : status === "error" ? "失敗" : "分享"}
      </span>
    </button>
  );
}
