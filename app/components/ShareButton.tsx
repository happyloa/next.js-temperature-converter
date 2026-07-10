"use client";

import { useCallback, useState } from "react";
import { Check, Share2, X } from "lucide-react";

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
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");

  const flash = useCallback((next: "copied" | "error") => {
    setStatus(next);
    window.setTimeout(() => setStatus("idle"), 2000);
  }, []);

  const handleShare = useCallback(async () => {
    const shareUrl = url ?? window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url: shareUrl });
        return;
      }
      await copyText(`${title}\n\n${text}\n\n${shareUrl}`);
      flash("copied");
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      try {
        await copyText(`${title}\n\n${text}\n\n${shareUrl}`);
        flash("copied");
      } catch {
        flash("error");
      }
    }
  }, [flash, text, title, url]);

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
