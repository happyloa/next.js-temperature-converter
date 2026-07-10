import { BaseSkeleton } from "./BaseSkeleton";

export function ChartGraphicSkeleton({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`mt-4 flex h-full min-h-64 flex-col justify-between gap-6 ${className}`}
      aria-hidden="true"
    >
      <div className="grid flex-1 grid-cols-7 items-end gap-3 border-b border-l border-edge-subtle px-3 pb-3">
        {[45, 68, 52, 76, 62, 82, 58].map((height, index) => (
          <BaseSkeleton
            key={`${height}-${index}`}
            className="w-full"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
      <div className="flex justify-center gap-6">
        <BaseSkeleton className="h-3 w-16" />
        <BaseSkeleton className="h-3 w-16" />
      </div>
    </div>
  );
}
