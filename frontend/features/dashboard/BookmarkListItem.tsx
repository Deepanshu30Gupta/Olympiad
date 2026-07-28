"use client";

import { useState } from "react";
import { Bookmark, X } from "lucide-react";
import { renderMathText } from "@/lib/render-math";
import { toggleBookmarkAction } from "@/app/actions";
import { PracticeBookmarkedQuestionButton } from "@/features/dashboard/PracticeBookmarkedQuestionButton";

interface BookmarkItemProps {
  questionId: string;
  externalId: string;
  examType: string | null;
  difficultyLabel: string | null;
  statement: string;
}

export function BookmarkListItem({ questionId, externalId, examType, difficultyLabel, statement }: BookmarkItemProps) {
  const [removed, setRemoved] = useState(false);
  const [removing, setRemoving] = useState(false);

  async function handleRemove() {
    if (removing) return;
    setRemoving(true);
    try {
      const res = await toggleBookmarkAction(questionId);
      if (res.bookmarked === false) {
        setRemoved(true);
      } else {
        setRemoving(false);
      }
    } catch {
      setRemoving(false);
    }
  }

  if (removed) return null;

  return (
    <div className="rounded-2xl border border-[#F0E6D6] bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2 font-mono text-xs text-[#6B5D4F] dark:text-neutral-500">
          <span className="rounded-full border border-[#F0E6D6] px-2.5 py-1 dark:border-neutral-800">{externalId}</span>
          {examType && <span className="rounded-full border border-[#F0E6D6] px-2.5 py-1 dark:border-neutral-800">{examType}</span>}
          {difficultyLabel && <span className="rounded-full border border-[#F0E6D6] px-2.5 py-1 dark:border-neutral-800">{difficultyLabel}</span>}
        </div>
        <button
          onClick={handleRemove}
          disabled={removing}
          aria-label="Remove bookmark"
          className="flex items-center gap-1 text-xs text-[#6B5D4F] transition-colors hover:text-[#D9502F] disabled:opacity-50 dark:text-neutral-500"
        >
          <Bookmark size={16} fill="#FF6B4A" color="#FF6B4A" />
          <X size={12} />
        </button>
      </div>
      <div className="mt-3 line-clamp-2 text-sm text-[#2B2118] dark:text-neutral-200" dangerouslySetInnerHTML={{ __html: renderMathText(statement) }} />
      <PracticeBookmarkedQuestionButton questionId={questionId} />
    </div>
  );
}