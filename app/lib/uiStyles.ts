export const ui = {
  pageShell: "w-full px-4 py-8 md:px-8 md:py-12",
  workspace: "mx-auto w-full max-w-[1240px]",
  panel: "min-w-0 border border-edge-subtle bg-surface-strong",
  pageTitle:
    "text-[2.25rem] font-bold leading-[1.15] tracking-[-0.04em] text-ink-strong sm:text-5xl lg:text-[4rem]",
  description: "mt-4 max-w-xl text-sm leading-relaxed text-ink-medium",
  sectionTitle: "text-lg font-bold leading-snug text-ink-strong",
  headingRow: "flex min-w-0 items-center justify-between gap-4",
  button:
    "inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap border px-3.5 py-2 text-xs font-bold transition-[border-color] disabled:cursor-not-allowed disabled:opacity-55",
  primaryButton:
    "border-accent-label bg-accent text-accent-ink hover:bg-accent-hover",
  secondaryButton:
    "border-edge-subtle bg-surface-strong text-ink-medium hover:border-ink-strong hover:text-ink-strong",
  successButton: "border-accent-label bg-surface-strong text-accent-label",
  dangerButton:
    "border-error-border bg-error-bg text-error-ink hover:border-error-ink",
  iconButton:
    "inline-flex size-11 shrink-0 items-center justify-center border border-edge-subtle bg-surface-strong text-ink-medium transition-[border-color] hover:border-ink-strong hover:text-ink-strong disabled:cursor-not-allowed disabled:opacity-55",
  fieldLabel: "block text-xs font-bold text-ink-medium",
  fieldHelp: "mt-2 text-xs leading-relaxed text-ink-subtle",
  rangeControl:
    "inline-flex shrink-0 gap-px border border-edge-subtle bg-edge-subtle max-[760px]:w-full",
  rangeButton:
    "min-h-10 px-3 py-1 text-xs font-bold transition-[border-color] max-[760px]:min-w-0 max-[760px]:flex-1",
  rangeButtonActive: "bg-ink-strong text-canvas",
  count:
    "shrink-0 border-l border-edge-subtle pl-3 text-xs font-bold text-ink-subtle",
  emptyState:
    "border border-dashed border-edge-strong bg-surface-medium p-5 text-left text-xs leading-relaxed text-ink-subtle",
} as const;
