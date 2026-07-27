"use client";

import { formatRelativeTime } from "@/lib/format-relative-time";
import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

export function SessionTimelineItem({
  id,
  name,
  status,
  startedAt,
  solved,
  wrong,
  surrendered,
  totalTimeSeconds,
  accuracyPct,
  netRatingChange,
}: {
  id: string;
  name: string;
  status: string;
  startedAt: string;
  solved: number;
  wrong: number;
  surrendered: number;
  totalTimeSeconds: number;
  accuracyPct: number;
  netRatingChange: number | null;
}) {
  const [open, setOpen] = useState(false);
  const minutes = Math.floor(totalTimeSeconds / 60);
  const seconds = totalTimeSeconds % 60;
  const durationLabel = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

  return (
    <div className="relative mb-6 last:mb-0">
      <div className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-[#FF6B4A] dark:border-neutral-950" />

      <div className="rounded-2xl border border-[#F0E6D6] bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-semibold text-[#2B2118] dark:text-neutral-100">{name}</span>
            {status === "ACTIVE" && (
              <span className="ml-2 rounded-full bg-[#E6F7E0] px-2 py-0.5 text-[11px] font-semibold text-[#2E6B1B] dark:bg-emerald-950 dark:text-emerald-300">
                In Progress
              </span>
            )}
          </div>
          <span className="text-xs text-[#6B5D4F] dark:text-neutral-500">{formatRelativeTime(startedAt)}</span>
        </div>

        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#6B5D4F] dark:text-neutral-500">
          <span>
            <span className="font-semibold text-[#2B2118] dark:text-neutral-200">{accuracyPct}%</span> accuracy
          </span>
          <span>
            <span className="font-semibold text-[#2B2118] dark:text-neutral-200">{durationLabel}</span> duration
          </span>
          {netRatingChange !== null && (
            <span className={netRatingChange >= 0 ? "text-[#2E6B1B] dark:text-emerald-400" : "text-[#D9502F] dark:text-red-400"}>
              {netRatingChange >= 0 ? "▲" : "▼"} {Math.abs(netRatingChange)} rating
            </span>
          )}
        </div>

        <div className="mt-2 flex flex-wrap gap-3 text-xs text-[#6B5D4F] dark:text-neutral-500">
          <span className="text-[#2E6B1B] dark:text-emerald-400">{solved} solved</span>
          <span className="text-[#D9502F] dark:text-red-400">{wrong} wrong</span>
          <span>{surrendered} gave up</span>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <button onClick={() => setOpen(!open)} className="flex items-center gap-1 text-xs font-semibold text-[#4C3AA0] dark:text-indigo-400">
            Details <ChevronDown size={14} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
          </button>
          {status === "ACTIVE" && (
            <Link href={`/practice?sessionId=${id}`} className="rounded-full bg-[#FF6B4A] px-3 py-1 text-xs font-semibold text-white hover:bg-[#D9502F]">
              Resume →
            </Link>
          )}
        </div>

        {open && (
          <div className="mt-2 border-t border-[#F0E6D6] pt-2 text-xs text-[#6B5D4F] dark:border-neutral-800 dark:text-neutral-400">
            <p>
              {solved + wrong + surrendered} question{solved + wrong + surrendered !== 1 ? "s" : ""} completed in this session.
            </p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-[#FFFBF2] px-2 py-1.5 text-center dark:bg-neutral-800">
                <div className="font-bold text-[#2B2118] dark:text-neutral-100">{accuracyPct}%</div>
                <div className="text-[10px]">Accuracy</div>
              </div>
              <div className="rounded-lg bg-[#FFFBF2] px-2 py-1.5 text-center dark:bg-neutral-800">
                <div className="font-bold text-[#2B2118] dark:text-neutral-100">{durationLabel}</div>
                <div className="text-[10px]">Duration</div>
              </div>
              <div className="rounded-lg bg-[#FFFBF2] px-2 py-1.5 text-center dark:bg-neutral-800">
                <div className={`font-bold ${netRatingChange !== null && netRatingChange >= 0 ? "text-[#2E6B1B]" : "text-[#D9502F]"}`}>
                  {netRatingChange !== null ? `${netRatingChange >= 0 ? "+" : ""}${netRatingChange}` : "—"}
                </div>
                <div className="text-[10px]">Rating Change</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}