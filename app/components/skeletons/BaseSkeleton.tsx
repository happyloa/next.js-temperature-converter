"use client";

import { cn } from "../../lib/utils";

interface BaseSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function BaseSkeleton({ className, ...props }: BaseSkeletonProps) {
  return (
    <div
      className={cn("skeleton-shimmer rounded-md", className)}
      {...props}
    />
  );
}
