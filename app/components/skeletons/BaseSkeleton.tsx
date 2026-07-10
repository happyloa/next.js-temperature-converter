import type { HTMLAttributes } from "react";

import { cn } from "../../lib/utils";

type BaseSkeletonProps = HTMLAttributes<HTMLDivElement>;

export function BaseSkeleton({ className, ...props }: BaseSkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-surface-muted", className)}
      {...props}
    />
  );
}
