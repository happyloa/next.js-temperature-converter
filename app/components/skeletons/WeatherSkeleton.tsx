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
          "grid min-h-64 min-w-0 gap-5 border-l-4 border-l-accent p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:p-5",
        )}
      >
        <div className="space-y-3">
          <BaseSkeleton className="h-3 w-28" />
          <BaseSkeleton className="h-10 w-56 max-w-full" />
          <BaseSkeleton className="h-4 w-72 max-w-full" />
        </div>
        <BaseSkeleton className="h-14 w-32" />
        <BaseSkeleton className="h-20 w-44" />
        <BaseSkeleton className="h-10 w-36" />
      </div>
      <div className={cn(ui.panel, "p-4 sm:p-5")}>
        <BaseSkeleton className="h-6 w-32" />
        <div className="mt-3.5 grid min-w-0 grid-cols-1 gap-px overflow-hidden rounded-lg border border-edge-subtle bg-edge-subtle sm:grid-cols-2 min-[900px]:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="relative grid h-24 min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 bg-surface-medium p-3.5"
            >
              <BaseSkeleton className="h-5 w-5" />
              <BaseSkeleton className="h-4 w-20" />
              <BaseSkeleton className="h-7 w-16" />
            </div>
          ))}
        </div>
      </div>
      <div className={cn(ui.panel, "h-112 p-4 sm:p-5")}>
        <BaseSkeleton className="h-6 w-32" />
        <ChartGraphicSkeleton />
      </div>
    </div>
  );
}
