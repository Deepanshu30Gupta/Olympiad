"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface Entry {
  id: string;
  name: string;
  value: string;
}

export function LeaderboardSection({
  title,
  icon,
  entries,
  rankColors,
  accent,
  emptyMessage,
  myRank,
  myValue,
}: {
  title: string;
  icon: React.ReactNode;
  entries: Entry[];
  rankColors: string[];
  accent: string;
  emptyMessage: string;
  myRank: number | null;
  myValue: string | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const visibleEntries = expanded ? entries : entries.slice(0, 3);
  const amInTopThree = myRank !== null && myRank <= 3;

  return (
    <div className="rounded-3xl border border-[#F0E6D6] bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-lg font-bold text-[#2B2118] dark:text-neutral-100" style={{ fontFamily: "var(--font-fredoka), sans-serif" }}>
          {title}
        </h2>
      </div>

      {entries.length === 0 ? (
        <p className="mt-6 text-sm text-[#6B5D4F] dark:text-neutral-400">{emptyMessage}</p>
      ) : (
        <>
          <div className="mt-5 flex flex-col gap-1.5">
            {visibleEntries.map((entry, i) => (
              <div key={entry.id} className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-[#FFFBF2] dark:hover:bg-neutral-800">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: i < 3 ? rankColors[i] : "#D8CBB5" }}>
                  {i + 1}
                </span>
                <span className="flex-1 truncate text-sm font-medium text-[#2B2118] dark:text-neutral-200">{entry.name}</span>
                <span className="text-sm font-bold" style={{ color: accent }}>{entry.value}</span>
              </div>
            ))}
          </div>

          {entries.length > 3 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg py-2 text-xs font-semibold text-[#4C3AA0] transition-colors hover:bg-[#FFFBF2] dark:text-indigo-400 dark:hover:bg-neutral-800"
            >
              {expanded ? "Show less" : `See full leaderboard (${entries.length})`}
              <ChevronDown size={13} className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
            </button>
          )}

          {myRank !== null && myValue !== null && !amInTopThree && !expanded && (
            <div className="mt-3 flex items-center gap-3 rounded-xl border border-dashed border-[#4C3AA0]/40 bg-[#ECE8FA]/50 px-3 py-2.5 dark:border-indigo-800 dark:bg-indigo-950/20">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#4C3AA0] text-xs font-bold text-white">
                {myRank}
              </span>
              <span className="flex-1 truncate text-sm font-semibold text-[#2B2118] dark:text-neutral-200">You</span>
              <span className="text-sm font-bold" style={{ color: accent }}>{myValue}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}