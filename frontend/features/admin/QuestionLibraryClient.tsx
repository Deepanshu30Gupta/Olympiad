"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { previewQuestionAsAdminAction } from "@/app/admin-actions";

interface QuestionRow {
  externalId: string;
  problemNumber: number;
  examType: string | null;
  contestYear: number | null;
  contestSource: string | null;
}

interface YearGroup {
  year: number;
  questions: QuestionRow[];
}

interface ExamGroup {
  exam: string;
  years: YearGroup[];
}

export function QuestionLibraryClient({ structured }: { structured: ExamGroup[] }) {
  return (
    <div className="mt-6 flex flex-col gap-3">
      {structured.map((examGroup) => (
        <ExamSection key={examGroup.exam} examGroup={examGroup} />
      ))}
    </div>
  );
}

function ExamSection({ examGroup }: { examGroup: ExamGroup }) {
  const [open, setOpen] = useState(true);
  const totalCount = examGroup.years.reduce((sum, y) => sum + y.questions.length, 0);

  return (
    <div className="rounded-2xl border border-[#F0E6D6] bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between px-5 py-4">
        <span className="text-base font-bold text-[#2B2118] dark:text-neutral-100">
          {examGroup.exam} <span className="text-xs font-normal text-[#6B5D4F] dark:text-neutral-500">({totalCount} questions)</span>
        </span>
        <ChevronDown size={18} className={`text-[#6B5D4F] transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="flex flex-col gap-2 border-t border-[#F0E6D6] px-5 py-4 dark:border-neutral-800">
          {examGroup.years.map((yearGroup) => (
            <YearSection key={yearGroup.year} examName={examGroup.exam} yearGroup={yearGroup} />
          ))}
        </div>
      )}
    </div>
  );
}

function YearSection({ examName, yearGroup }: { examName: string; yearGroup: YearGroup }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleOpenQuestion(externalId: string) {
    if (loadingId) return;
    setLoadingId(externalId);
    try {
      const res = await previewQuestionAsAdminAction(externalId);
      if (res.sessionId) {
        router.push(`/practice?sessionId=${res.sessionId}&returnTo=%2Fadmin%2Flibrary`);
      } else {
        setLoadingId(null);
      }
    } catch {
      setLoadingId(null);
    }
  }

  return (
    <div className="rounded-xl bg-[#FFFBF2] dark:bg-neutral-800/40">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between px-4 py-2.5">
        <span className="text-sm font-semibold text-[#2B2118] dark:text-neutral-200">
          {examName} {yearGroup.year || ""} <span className="text-xs font-normal text-[#6B5D4F] dark:text-neutral-500">({yearGroup.questions.length})</span>
        </span>
        <ChevronDown size={15} className={`text-[#6B5D4F] transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="flex flex-wrap gap-2 px-4 pb-4">
          {yearGroup.questions.map((q) => (
            <button
              key={q.externalId}
              onClick={() => handleOpenQuestion(q.externalId)}
              disabled={loadingId === q.externalId}
              className="rounded-lg border border-[#F0E6D6] bg-white px-3 py-1.5 text-xs font-semibold text-[#2B2118] transition-colors hover:border-[#FF6B4A] hover:bg-[#FFE8E0] disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
            >
              {loadingId === q.externalId ? "Opening..." : `P${q.problemNumber}`}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}