"use client";

import { useEffect, useState } from "react";

export function SessionTimer({ baseSeconds }: { baseSeconds: number }) {
  const [totalElapsed, setTotalElapsed] = useState(baseSeconds);
  const [thisVisitElapsed, setThisVisitElapsed] = useState(0);

  useEffect(() => {
    const mountedAt = Date.now();
    const tick = () => {
      const secondsSinceMount = Math.floor((Date.now() - mountedAt) / 1000);
      setTotalElapsed(baseSeconds + secondsSinceMount);
      setThisVisitElapsed(secondsSinceMount);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [baseSeconds]);

  function format(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  return (
    <div className="flex items-center gap-2">
      <span
        title="Total time across all your visits to this session"
        className="rounded-full border border-[#F0E6D6] bg-white px-3 py-1 text-xs font-semibold text-[#6B5D4F] dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400"
      >
        ⏱ Total: {format(totalElapsed)}
      </span>
      <span
        title="Time spent since you opened this just now"
        className="rounded-full border border-[#F0E6D6] bg-[#FFFBF2] px-3 py-1 text-xs font-semibold text-[#4C3AA0] dark:border-neutral-800 dark:bg-neutral-800 dark:text-indigo-300"
      >
        🕐 This visit: {format(thisVisitElapsed)}
      </span>
    </div>
  );
}