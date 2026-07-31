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

interface SourceGroup {
  source: string;
  questions: QuestionRow[];
}

interface ExamGroup {
  exam: string;
  sources: SourceGroup[];
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
  const totalCount = examGroup.sources.reduce((sum, s) => sum + s.questions.length, 0);

  return (
    <div className="rounded-2xl border border-[#F0E6D6] bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between px-5 py-4">
        <span className="text-base font-bold text-[#2B2118] dark:text-neutral-100">
          {examGroup.exam} <span className="text-xs font-normal text-[#6B5D4F] dark:text-neutral-500">({totalCount} questions, {examGroup.sources.length} sittings)</span>
        </span>
        <ChevronDown size={18} className={`text-[#6B5D4F] transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="flex flex-col gap-2 border-t border-[#F0E6D6] px-5 py-4 dark:border-neutral-800">
          {examGroup.sources.map((sourceGroup) => (
            <SourceSection key={sourceGroup.source} sourceGroup={sourceGroup} />
          ))}
        </div>
      )}
    </div>
  );
}

function SourceSection({ sourceGroup }: { sourceGroup: SourceGroup }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const missingSourceTag = sourceGroup.source.includes("(no contestSource set)");

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
        <span className="flex items-center gap-2 text-sm font-semibold text-[#2B2118] dark:text-neutral-200">
          {sourceGroup.source}
          {missingSourceTag && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
              missing contestSource tag
            </span>
          )}
          <span className="text-xs font-normal text-[#6B5D4F] dark:text-neutral-500">({sourceGroup.questions.length})</span>
        </span>
        <ChevronDown size={15} className={`text-[#6B5D4F] transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="flex flex-wrap gap-2 px-4 pb-4">
          {sourceGroup.questions.map((q) => (
            <button
              key={q.externalId}
              onClick={() => handleOpenQuestion(q.externalId)}
              disabled={loadingId === q.externalId}
              title={q.externalId}
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