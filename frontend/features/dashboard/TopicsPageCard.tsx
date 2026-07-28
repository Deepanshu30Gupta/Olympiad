"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Play } from "lucide-react";
import { formatRelativeTime } from "@/lib/format-relative-time";
import { createSessionAction } from "@/app/practice/actions";
import { Spinner } from "@/components/ui/Spinner";

interface AttemptEntry {
  id: string;
  sessionId: string | null;
  externalId: string;
  statement: string;
  status: string;
}

export function TopicsPageCard({
  categoryName,
  categorySlug,
  stars,
  solved,
  wrong,
  totalQuestions,
  completed,
  attempts,
  lastPracticed,
}: {
  categoryName: string;
  categorySlug: string;
  stars: number;
  solved: number;
  wrong: number;
  totalQuestions: number;
  completed: number;
  attempts: AttemptEntry[];
  lastPracticed: Date | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [starting, setStarting] = useState(false);

  const accuracy = solved + wrong > 0 ? Math.round((solved / (solved + wrong)) * 100) : 0;
  const progressPct = totalQuestions > 0 ? Math.min(100, Math.round((completed / totalQuestions) * 100)) : 0;
  const remaining = Math.max(0, totalQuestions - completed);
  const lastPracticedLabel = lastPracticed ? formatRelativeTime(lastPracticed) : null;

  async function handlePracticeThisTopic() {
    if (starting) return;
    setStarting(true);
    try {
      const res = await createSessionAction([], [categorySlug]);
      if (res.sessionId) {
        router.push(`/practice?sessionId=${res.sessionId}`);
      } else {
        setStarting(false);
      }
    } catch {
      setStarting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-[#F0E6D6] bg-white p-5 transition-all duration-200 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-[#2B2118] dark:text-neutral-100">{categoryName}</h3>
        <span className="font-bold text-[#4C3AA0] dark:text-indigo-400">★ {stars}</span>
      </div>

      <div className="mt-3 h-1.5 rounded-full bg-[#F0E6D6] dark:bg-neutral-800">
        <div className="h-1.5 rounded-full bg-[#FF6B4A]" style={{ width: `${progressPct}%` }} />
      </div>
      <div className="mt-1.5 flex flex-wrap justify-between gap-x-3 text-xs text-[#6B5D4F] dark:text-neutral-500">
        <span>{completed} of {totalQuestions || "?"} questions</span>
        <span>{accuracy}% accuracy</span>
      </div>
      <div className="mt-1 flex flex-wrap justify-between gap-x-3 text-[11px] text-[#8A7C6C] dark:text-neutral-600">
        <span>{remaining} remaining</span>
        {lastPracticedLabel && <span>Last practiced {lastPracticedLabel}</span>}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <button
          onClick={handlePracticeThisTopic}
          disabled={starting}
          className="flex items-center gap-1.5 rounded-lg bg-[#FF6B4A] px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-[#D9502F] disabled:opacity-60"
        >
          {starting ? <Spinner /> : <Play size={12} />}
          {starting ? "Starting..." : "Practice this topic"}
        </button>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1 text-xs font-semibold text-[#4C3AA0] dark:text-indigo-400"
        >
          {open ? "Hide details" : "Show details"}
          <ChevronDown size={14} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </button>
      </div>

      {open && (
        <div className="mt-3 border-t border-[#F0E6D6] pt-3 dark:border-neutral-800">
          <p className="text-xs font-semibold text-[#6B5D4F] dark:text-neutral-400">
            All attempted questions ({attempts.length})
          </p>
          {attempts.length > 0 ? (
            <ul className="mt-1.5 flex max-h-48 flex-col gap-1 overflow-y-auto">
              {attempts.map((a, i) => {
                const badge = (
                  <span
                    className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                      a.status === "SOLVED"
                        ? "bg-[#E6F7E0] text-[#2E6B1B] dark:bg-emerald-950 dark:text-emerald-300"
                        : a.status === "WRONG"
                          ? "bg-[#FFE8E0] text-[#D9502F] dark:bg-red-950 dark:text-red-300"
                          : "bg-[#F0E6D6] text-[#6B5D4F] dark:bg-neutral-800 dark:text-neutral-400"
                    }`}
                  >
                    {a.status === "SOLVED" ? "✓" : a.status === "WRONG" ? "✗" : "—"}
                  </span>
                );
                return a.sessionId ? (
                  <Link
                    key={a.id}
                    href={`/practice?sessionId=${a.sessionId}&reviewAttemptId=${a.id}&returnTo=%2Ftopics`}
                    className="flex items-center gap-2 rounded-lg px-1.5 py-1 text-xs transition-colors hover:bg-[#FFFBF2] dark:hover:bg-neutral-800"
                  >
                    {badge}
                    <span className="truncate text-[#8A7C6C] dark:text-neutral-500">{a.externalId}</span>
                  </Link>
                ) : (
                  <li key={a.id} className="flex items-center gap-2 px-1.5 py-1 text-xs" title="This attempt predates session tracking and can't be reviewed">
                    {badge}
                    <span className="truncate text-[#8A7C6C] dark:text-neutral-500">{a.externalId}</span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-1.5 text-xs text-[#8A7C6C] dark:text-neutral-500">No attempts yet.</p>
          )}
        </div>
      )}
    </div>
  );
}