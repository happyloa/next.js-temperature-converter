"use client";

import { BaseSkeleton } from "./BaseSkeleton";

export function SummaryCardSkeleton() {
  return (
    <div className="border-edge-subtle bg-surface-light flex items-center justify-between rounded-3xl border px-6 py-4">
      <div className="flex items-center gap-4">
        <BaseSkeleton className="h-8 w-8 rounded-full" />
        <div className="flex flex-col gap-1">
          <BaseSkeleton className="h-4 w-16" />
          <BaseSkeleton className="h-3 w-12" />
        </div>
      </div>
      <BaseSkeleton className="h-6 w-12" />
    </div>
  );
}

export function MetricBoxSkeleton() {
  return (
    <div className="border-edge-subtle bg-surface-soft flex h-40 flex-col justify-between rounded-3xl border p-6">
      <BaseSkeleton className="h-4 w-20" />
      <div className="flex items-end justify-between">
        <BaseSkeleton className="h-10 w-24" />
        <BaseSkeleton className="h-8 w-8 rounded-full opacity-50" />
      </div>
    </div>
  );
}

export function AirQualitySkeleton() {
  return (
    <div className="border-edge-subtle bg-surface-soft flex h-full min-h-40 flex-col justify-between rounded-3xl border p-6">
      <div className="mb-4 flex items-center justify-between">
        <BaseSkeleton className="h-4 w-24" />
        <BaseSkeleton className="h-5 w-12 rounded" />
      </div>
      <div className="flex flex-col gap-4">
        <BaseSkeleton className="h-10 w-16" />
        <div className="border-edge-subtle space-y-2 border-t pt-3">
          <div className="flex justify-between items-center">
            <BaseSkeleton className="h-3 w-12" />
            <BaseSkeleton className="h-3 w-10" />
          </div>
          <div className="flex justify-between items-center">
            <BaseSkeleton className="h-3 w-12" />
            <BaseSkeleton className="h-3 w-10" />
          </div>
        </div>
      </div>
    </div>
  );
}
