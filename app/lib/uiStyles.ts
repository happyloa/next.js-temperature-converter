export const ui = {
  pageShell: "w-full px-4 py-6 md:px-6 md:py-8 max-[430px]:px-3",
  workspace: "mx-auto w-full max-w-[1180px]",
  panel:
    "min-w-0 rounded-2xl border border-edge-subtle bg-surface-strong shadow-[var(--shadow)]",
  kicker:
    "text-[0.6875rem] font-extrabold leading-tight tracking-[0.14em] text-accent uppercase",
  pageTitle:
    "mt-2 text-[1.875rem] font-[780] leading-[1.12] tracking-[-0.025em] text-ink-strong md:text-[2.75rem]",
  description:
    "mt-3 max-w-2xl text-[0.9375rem] leading-relaxed text-ink-medium",
  sectionTitle: "text-[1.0625rem] font-[750] leading-snug text-ink-strong",
  headingRow: "flex min-w-0 items-center justify-between gap-4",
  button:
    "inline-flex min-h-10 items-center justify-center gap-2 whitespace-nowrap rounded-xl border px-3.5 py-2 text-[0.8125rem] font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-55",
  primaryButton:
    "border-accent bg-accent text-accent-ink hover:border-accent-hover hover:bg-accent-hover",
  secondaryButton:
    "border-edge-subtle bg-surface-medium text-ink-medium hover:border-edge-strong hover:bg-surface-soft hover:text-ink-strong",
  successButton:
    "border-accent bg-surface-soft text-accent hover:border-accent-hover",
  dangerButton:
    "border-error-border bg-error-bg text-error-ink hover:border-error-ink",
  iconButton:
    "inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-edge-subtle bg-surface-medium text-ink-medium transition-colors hover:border-edge-strong hover:bg-surface-soft hover:text-ink-strong disabled:cursor-not-allowed disabled:opacity-55",
  fieldLabel: "block text-xs font-bold text-ink-medium",
  fieldHelp: "mt-1.5 text-xs text-ink-subtle",
  rangeControl:
    "inline-flex shrink-0 gap-0.5 rounded-xl border border-edge-subtle bg-surface-soft p-1 max-[760px]:w-full",
  rangeButton:
    "min-h-8 rounded-lg px-2.5 py-1 text-xs font-bold transition-colors max-[760px]:min-w-0 max-[760px]:flex-1",
  rangeButtonActive: "bg-surface-strong text-ink-strong shadow-[var(--shadow)]",
  count:
    "shrink-0 rounded-full border border-edge-subtle bg-surface-soft px-2.5 py-1 text-[0.6875rem] font-bold text-ink-subtle",
  emptyState:
    "rounded-xl border border-dashed border-edge-strong bg-surface-medium p-4 text-center text-[0.8125rem] text-ink-subtle",
} as const;
