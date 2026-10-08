import { ChartGraphicSkeleton } from "./ChartSkeleton";
import { BaseSkeleton } from "./BaseSkeleton";
import { ui } from "../../lib/uiStyles";
import { cn } from "../../lib/utils";

export function WeatherSkeleton() {
  return (
    <div className="flex min-w-0 flex-col gap-5" aria-hidden="true">
      <div
        className={cn(
          ui.panel,
          "grid min-h-64 min-w-0 gap-6 border-t-2 border-t-accent-label p-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:p-8",
        )}
      >
        <div className="space-y-3">
          <BaseSkeleton className="h-3 w-28" />
          <BaseSkeleton className="h-10 w-56 max-w-full" />
          <BaseSkeleton className="h-4 w-72 max-w-full" />
        </div>
        <BaseSkeleton className="h-14 w-32" />
        <BaseSkeleton className="h-24 w-44 sm:h-34" />
        <BaseSkeleton className="h-10 w-36" />
      </div>
      <div className={cn(ui.panel, "p-5 sm:p-6")}>
        <BaseSkeleton className="h-6 w-32" />
        <div className="mt-3.5 grid min-w-0 grid-cols-1 gap-px overflow-hidden border border-edge-subtle bg-edge-subtle sm:grid-cols-2 min-[900px]:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="relative grid h-28 min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 bg-surface-medium p-5"
            >
              <BaseSkeleton className="h-5 w-5" />
              <BaseSkeleton className="h-4 w-20" />
              <BaseSkeleton className="h-7 w-16" />
            </div>
          ))}
        </div>
      </div>
      <div className={cn(ui.panel, "flex h-126 flex-col p-5 sm:p-6")}>
        <div className="flex items-start justify-between gap-4 max-[760px]:flex-col">
          <div className="space-y-2">
            <BaseSkeleton className="h-3 w-20" />
            <BaseSkeleton className="h-5 w-28" />
            <BaseSkeleton className="h-3 w-36" />
          </div>
          <BaseSkeleton className="h-10 w-24 max-[760px]:w-full" />
        </div>
        <ChartGraphicSkeleton className="mt-4 min-h-0 flex-1" />
      </div>
    </div>
  );
}
