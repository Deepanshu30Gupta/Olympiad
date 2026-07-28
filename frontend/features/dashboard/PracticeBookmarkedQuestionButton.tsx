"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { startBookmarkedQuestionAction } from "@/app/practice/actions";
import { Spinner } from "@/components/ui/Spinner";

export function PracticeBookmarkedQuestionButton({ questionId }: { questionId: string }) {
  const router = useRouter();
  const [starting, setStarting] = useState(false);

  async function handleClick() {
    if (starting) return;
    setStarting(true);
    try {
      const res = await startBookmarkedQuestionAction(questionId);
      if (res.sessionId) {
        router.push(`/practice?sessionId=${res.sessionId}&returnTo=%2Fbookmarks`);
      } else {
        setStarting(false);
      }
    } catch {
      setStarting(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={starting}
      className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-[#4C3AA0] disabled:opacity-60 dark:text-indigo-400"
    >
      {starting && <Spinner />}
      {starting ? "Opening..." : "Practice this question →"}
    </button>
  );
}