import { ChartGraphicSkeleton } from "./ChartSkeleton";
import { BaseSkeleton } from "./BaseSkeleton";

export function WeatherSkeleton() {
  return (
    <div className="weather-content" aria-hidden="true">
      <div className="current-conditions min-h-64">
        <div className="space-y-3">
          <BaseSkeleton className="h-3 w-28" />
          <BaseSkeleton className="h-10 w-56 max-w-full" />
          <BaseSkeleton className="h-4 w-72 max-w-full" />
        </div>
        <BaseSkeleton className="h-14 w-32" />
        <BaseSkeleton className="h-20 w-44" />
        <BaseSkeleton className="h-10 w-36" />
      </div>
      <div className="metrics-section">
        <BaseSkeleton className="h-6 w-32" />
        <div className="metric-grid">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="metric-tile h-24">
              <BaseSkeleton className="h-5 w-5" />
              <BaseSkeleton className="h-4 w-20" />
              <BaseSkeleton className="h-7 w-16" />
            </div>
          ))}
        </div>
      </div>
      <div className="forecast-section h-112">
        <BaseSkeleton className="h-6 w-32" />
        <ChartGraphicSkeleton />
      </div>
    </div>
  );
}
