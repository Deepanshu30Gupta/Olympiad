"use client";

import { useState } from "react";
import { ratingToStars } from "@/lib/rating-display";

interface AttemptRow {
  externalId: string;
  statement: string;
  status: string;
  activeSolvingSeconds: number | null;
  submittedAt: string | null;
}

interface TopicCardProps {
  categoryName: string;
  rating: number;
  solved: number;
  wrong: number;
  surrendered: number;
  totalTimeSeconds: number;
  attempts: AttemptRow[];
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

const STATUS_STYLE: Record<string, string> = {
  SOLVED: "bg-[#E6F7E0] text-[#2E6B1B] dark:bg-emerald-950 dark:text-emerald-300",
  WRONG: "bg-[#FFE8E0] text-[#D9502F] dark:bg-red-950 dark:text-red-300",
  SURRENDERED: "bg-[#F0E6D6] text-[#6B5D4F] dark:bg-neutral-800 dark:text-neutral-400",
};

const STATUS_LABEL: Record<string, string> = {
  SOLVED: "Solved",
  WRONG: "Wrong",
  SURRENDERED: "Gave up",
};

export function TopicCard({
  categoryName,
  rating,
  solved,
  wrong,
  surrendered,
  totalTimeSeconds,
  attempts,
}: TopicCardProps) {
  const [open, setOpen] = useState(false);
  const total = solved + wrong + surrendered;
  const accuracy = total > 0 ? Math.round((solved / total) * 100) : null;
  const stars = ratingToStars(rating);

  return (
    <div className="rounded-2xl border border-[#F0E6D6] bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-start justify-between">
        <div>
          <div
            className="text-base font-semibold text-[#2B2118] dark:text-neutral-100"
            style={{ fontFamily: "var(--font-fredoka), sans-serif" }}
          >
            {categoryName}
          </div>
          <div className="mt-0.5 text-xs text-[#6B5D4F] dark:text-neutral-500">
            {total} attempted{accuracy !== null ? ` · ${accuracy}% accuracy` : ""}
          </div>
        </div>
        <div
          className="text-xl font-bold text-[#4C3AA0] dark:text-indigo-400"
          style={{ fontFamily: "var(--font-fredoka), sans-serif" }}
        >
          ★ {stars}
        </div>
      </div>

      <div className="mt-3 flex gap-4 text-xs">
        <span className="text-[#2E6B1B] dark:text-emerald-400">{solved} solved</span>
        <span className="text-[#D9502F] dark:text-red-400">{wrong} wrong</span>
        <span className="text-[#6B5D4F] dark:text-neutral-500">{surrendered} gave up</span>
        <span className="ml-auto text-[#6B5D4F] dark:text-neutral-500">{formatTime(totalTimeSeconds)} total</span>
      </div>

      {attempts.length > 0 && (
        <button
          onClick={() => setOpen(!open)}
          className="mt-3 text-xs font-semibold text-[#4C3AA0] transition-colors hover:text-[#6650C4] dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          {open ? "Hide" : "Show"} question history ({attempts.length}) {open ? "▲" : "▼"}
        </button>
      )}

      {open && (
        <div className="mt-3 flex flex-col gap-1.5">
          {attempts.map((a, i) => (
            <div
              key={`${a.externalId}-${i}`}
              className="flex items-center gap-2.5 rounded-lg bg-[#FFFBF2] px-2.5 py-2 text-xs dark:bg-neutral-800"
            >
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_STYLE[a.status] ?? STATUS_STYLE.WRONG}`}
              >
                {STATUS_LABEL[a.status] ?? a.status}
              </span>
              <span className="flex-1 truncate text-[#2B2118] dark:text-neutral-200">{a.externalId}</span>
              <span className="shrink-0 font-mono text-[#6B5D4F] dark:text-neutral-500">
                {a.activeSolvingSeconds !== null ? formatTime(a.activeSolvingSeconds) : "—"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}