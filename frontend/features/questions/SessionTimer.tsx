"use client";

import { useEffect, useState } from "react";

export function SessionTimer({ baseSeconds }: { baseSeconds: number }) {
  const [elapsed, setElapsed] = useState(baseSeconds);

  useEffect(() => {
    const mountedAt = Date.now();
    const tick = () => {
      const secondsSinceMount = Math.floor((Date.now() - mountedAt) / 1000);
      setElapsed(baseSeconds + secondsSinceMount);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [baseSeconds]);

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  return (
    <span className="rounded-full border border-[#F0E6D6] bg-white px-3 py-1 text-xs font-semibold text-[#6B5D4F] dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
      ⏱ Session time: {minutes}:{String(seconds).padStart(2, "0")}
    </span>
  );
}