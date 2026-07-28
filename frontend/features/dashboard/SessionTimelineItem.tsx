"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronDown, Pencil, Check, X as XIcon } from "lucide-react";
import { formatRelativeTime } from "@/lib/format-relative-time";
import { resumeSessionAction, renameSessionAction } from "@/app/practice/actions";
import { Spinner } from "@/components/ui/Spinner";

interface SessionQuestion {
  attemptId: string;
  externalId: string;
  status: string;
}

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
  questions,
  examTypes,
  topicNames,
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
  questions: SessionQuestion[];
  examTypes: string[];
  topicNames: string[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [resuming, setResuming] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [nameValue, setNameValue] = useState(name);
  const [displayName, setDisplayName] = useState(name);
  const [savingName, setSavingName] = useState(false);
  const minutes = Math.floor(totalTimeSeconds / 60);
  const seconds = totalTimeSeconds % 60;
  const durationLabel = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

  async function handleResume() {
    if (resuming) return;
    if (status === "ACTIVE") {
      router.push(`/practice?sessionId=${id}`);
      return;
    }
    setResuming(true);
    try {
      const res = await resumeSessionAction(id);
      if (!res.error) {
        router.push(`/practice?sessionId=${id}`);
      } else {
        setResuming(false);
      }
    } catch {
      setResuming(false);
    }
  }

  async function handleSaveName() {
    if (!nameValue.trim() || savingName) return;
    setSavingName(true);
    try {
      const res = await renameSessionAction(id, nameValue.trim());
      if (!res.error) {
        setDisplayName(nameValue.trim());
        setRenaming(false);
      }
    } finally {
      setSavingName(false);
    }
  }

  return (
    <div className="relative mb-6 last:mb-0">
      <div className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-[#FF6B4A] dark:border-neutral-950" />

      <div className="rounded-2xl border border-[#F0E6D6] bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {renaming ? (
              <>
                <input
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                  autoFocus
                  className="rounded border border-[#F0E6D6] bg-white px-2 py-0.5 text-sm font-semibold text-[#2B2118] outline-none focus:border-[#4C3AA0] dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
                <button onClick={handleSaveName} disabled={savingName} className="text-[#2E6B1B] disabled:opacity-50">
                  {savingName ? <Spinner /> : <Check size={15} />}
                </button>
                <button onClick={() => { setRenaming(false); setNameValue(displayName); }} className="text-[#6B5D4F]">
                  <XIcon size={15} />
                </button>
              </>
            ) : (
              <>
                <span className="font-semibold text-[#2B2118] dark:text-neutral-100">{displayName}</span>
                <button onClick={() => setRenaming(true)} aria-label="Rename session" className="text-[#6B5D4F] transition-colors hover:text-[#4C3AA0] dark:text-neutral-500">
                  <Pencil size={12} />
                </button>
              </>
            )}
            {status === "ACTIVE" && (
              <span className="ml-1 rounded-full bg-[#E6F7E0] px-2 py-0.5 text-[11px] font-semibold text-[#2E6B1B] dark:bg-emerald-950 dark:text-emerald-300">
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
          <span className="font-semibold text-[#B23A1F] dark:text-red-300">{wrong} wrong</span>
          <span>{surrendered} not answered</span>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <button onClick={() => setOpen(!open)} className="flex items-center gap-1 text-xs font-semibold text-[#4C3AA0] dark:text-indigo-400">
            Details <ChevronDown size={14} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
          </button>
          <button
            onClick={handleResume}
            disabled={resuming}
            className="flex items-center gap-1.5 rounded-full bg-[#FF6B4A] px-3 py-1 text-xs font-semibold text-white transition-all hover:bg-[#D9502F] disabled:opacity-60"
          >
            {resuming && <Spinner />}
            {resuming ? "Resuming..." : "Resume →"}
          </button>
        </div>

        {open && (
          <div className="mt-2 border-t border-[#F0E6D6] pt-2 text-xs text-[#6B5D4F] dark:border-neutral-800 dark:text-neutral-400">
            {(examTypes.length > 0 || topicNames.length > 0) && (
              <div className="mb-3 flex flex-wrap gap-1.5">
                {examTypes.map((e) => (
                  <span key={e} className="rounded-full bg-[#ECE8FA] px-2 py-0.5 text-[10px] font-semibold text-[#4C3AA0] dark:bg-indigo-950/40 dark:text-indigo-300">
                    {e}
                  </span>
                ))}
                {topicNames.map((t) => (
                  <span key={t} className="rounded-full bg-[#FFE8E0] px-2 py-0.5 text-[10px] font-semibold text-[#D9502F] dark:bg-red-950/40 dark:text-red-300">
                    {t}
                  </span>
                ))}
                {examTypes.length === 0 && topicNames.length === 0 && (
                  <span className="rounded-full bg-[#F0E6D6] px-2 py-0.5 text-[10px] font-semibold text-[#6B5D4F] dark:bg-neutral-800 dark:text-neutral-400">
                    Mixed practice
                  </span>
                )}
              </div>
            )}
            <div className="grid grid-cols-3 gap-2">
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

            {questions.length > 0 && (
              <>
                <p className="mt-3 font-semibold text-[#6B5D4F] dark:text-neutral-400">
                  Questions attempted ({questions.length})
                </p>
                <ul className="mt-1.5 flex max-h-40 flex-col gap-1 overflow-y-auto">
                  {questions.map((q) => {
                    const badgeColor =
                      q.status === "SOLVED"
                        ? "bg-[#2E6B1B] text-white dark:bg-emerald-700"
                        : q.status === "WRONG"
                          ? "bg-[#D9502F] text-white"
                          : "bg-[#D8CBB5] text-[#4A3F33]";
                    return (
                      <li key={q.attemptId}>
                        <Link
                          href={`/practice?sessionId=${id}&reviewAttemptId=${q.attemptId}&returnTo=%2Fsessions`}
                          className="flex items-center gap-2 rounded-lg px-1.5 py-1 transition-colors hover:bg-[#FFFBF2] dark:hover:bg-neutral-800"
                        >
                          <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${badgeColor}`}>
                            {q.status === "SOLVED" ? "✓" : q.status === "WRONG" ? "✗" : "—"}
                          </span>
                          <span className="truncate text-[#8A7C6C] dark:text-neutral-500">{q.externalId}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}