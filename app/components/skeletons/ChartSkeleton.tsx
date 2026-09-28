import { BaseSkeleton } from "./BaseSkeleton";

export function ChartGraphicSkeleton({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`flex min-h-64 flex-col gap-3 ${className}`}
      aria-hidden="true"
    >
      <BaseSkeleton className="h-4 w-28 shrink-0" />
      <div className="flex min-h-0 flex-1 gap-2">
        <div className="flex w-8 shrink-0 flex-col justify-between py-1">
          {[1, 2, 3, 4].map((tick) => (
            <BaseSkeleton key={tick} className="h-2 w-full" />
          ))}
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 border-b border-l border-edge-strong">
            <svg
              className="h-full w-full animate-pulse"
              viewBox="0 0 700 240"
              preserveAspectRatio="none"
              fill="none"
              aria-hidden="true"
            >
              {[40, 100, 160, 220].map((y) => (
                <line
                  key={y}
                  x1="0"
                  y1={y}
                  x2="700"
                  y2={y}
                  stroke="var(--edge-subtle)"
                  strokeDasharray="3 4"
                />
              ))}
              {[0, 117, 233, 350, 467, 583, 700].map((x) => (
                <line
                  key={x}
                  x1={x}
                  y1="0"
                  x2={x}
                  y2="240"
                  stroke="var(--edge-subtle)"
                  strokeDasharray="3 4"
                />
              ))}
              <path
                d="M0 54 C55 54 80 58 117 58 S195 54 233 56 S310 60 350 62 S427 70 467 68 S545 64 583 66 S660 72 700 74"
                stroke="var(--ink-medium)"
                strokeWidth="2"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                opacity="0.7"
              />
              <path
                d="M0 132 C55 134 80 138 117 138 S195 135 233 136 S310 127 350 126 S427 130 467 132 S545 140 583 142 S660 139 700 140"
                stroke="var(--accent)"
                strokeWidth="2"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                opacity="0.7"
              />
            </svg>
          </div>
          <div className="mt-2 flex justify-between gap-2">
            {[1, 2, 3, 4, 5, 6, 7].map((tick) => (
              <BaseSkeleton key={tick} className="h-2 w-7 max-w-full" />
            ))}
          </div>
        </div>
      </div>
      <div className="flex shrink-0 justify-center gap-6">
        <BaseSkeleton className="h-3 w-16" />
        <BaseSkeleton className="h-3 w-16" />
      </div>
    </div>
  );
}
