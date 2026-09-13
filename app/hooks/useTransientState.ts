"use client";

import { useCallback, useEffect, useState } from "react";

/** A repeated notification restarts its timeout, including the same value. */
export function useTransientState<T>(initialValue: T, duration = 2000) {
  const [notification, setNotification] = useState<{ value: T } | null>(null);
  const show = useCallback((value: T) => setNotification({ value }), []);

  useEffect(() => {
    if (!notification) return;
    const timer = window.setTimeout(() => setNotification(null), duration);
    return () => window.clearTimeout(timer);
  }, [duration, notification]);

  return [notification ? notification.value : initialValue, show] as const;
}
