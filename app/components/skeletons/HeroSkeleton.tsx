"use client";

import { BaseSkeleton } from "./BaseSkeleton";

export function HeroSkeleton() {
  return (
    <div className="border-edge-subtle bg-surface-medium shadow-glass relative flex min-h-80 flex-col justify-between overflow-hidden rounded-3xl border p-8 lg:col-span-2">
      <div className="relative z-10 flex flex-col sm:flex-row items-start justify-between gap-6">
        <div className="flex-1 min-w-0 w-full space-y-4">
          <BaseSkeleton className="h-10 w-3/4 sm:h-12 sm:w-64" />
          <div className="flex flex-wrap gap-2">
            <BaseSkeleton className="h-4 w-32" />
            <BaseSkeleton className="h-5 w-20 rounded-full" />
          </div>
        </div>
        <div className="flex flex-col items-end sm:shrink-0 gap-2 text-right w-full sm:w-auto">
          <BaseSkeleton className="h-12 w-12 rounded-lg" />
          <BaseSkeleton className="h-4 w-24" />
        </div>
      </div>

      <div className="relative z-10 flex items-end gap-6">
        <div className="flex-1">
          <BaseSkeleton className="h-24 w-40 sm:h-32 sm:w-56 rounded-2xl" />
        </div>

        <div className="flex flex-col gap-2 pb-4 text-right">
          <BaseSkeleton className="h-6 w-32 ml-auto" />
          <BaseSkeleton className="h-4 w-20 ml-auto" />
        </div>
      </div>

      {/* Mimic the background gradient spot */}
      <div className="bg-accent/5 absolute -right-20 -top-20 h-96 w-96 rounded-full blur-3xl"></div>
    </div>
  );
}
