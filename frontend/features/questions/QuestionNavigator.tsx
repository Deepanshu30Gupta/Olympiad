import Link from "next/link";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

interface AttemptSummary {
  id: string;
  status: string;
}

export function QuestionNavigator({
  sessionId,
  attempts,
  currentReviewId,
  returnTo,
}: {
  sessionId: string;
  attempts: AttemptSummary[];
  currentReviewId: string | null;
  returnTo?: string;
}) {
  if (attempts.length === 0) return null;

  const returnToParam = returnTo ? `&returnTo=${encodeURIComponent(returnTo)}` : "";

  const currentIndex = currentReviewId ? attempts.findIndex((a) => a.id === currentReviewId) : -1;
  const prevAttempt = currentIndex > 0 ? attempts[currentIndex - 1] : currentIndex === -1 && attempts.length > 0 ? attempts[attempts.length - 1] : null;
  const nextAttempt = currentIndex >= 0 && currentIndex < attempts.length - 1 ? attempts[currentIndex + 1] : null;

  return (
    <div className="rounded-2xl border border-[#F0E6D6] bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <h3 className="text-sm font-bold text-[#2B2118] dark:text-neutral-100">Question Navigator</h3>
      <p className="mt-0.5 text-[11px] text-[#6B5D4F] dark:text-neutral-500">
        Review questions you&rsquo;ve already attempted in this session.
      </p>

      <div className="mt-3 grid grid-cols-5 gap-2">
        {attempts.map((a, i) => {
          const color =
            a.status === "SOLVED"
              ? "bg-[#2E6B1B] text-white"
              : a.status === "WRONG"
                ? "bg-[#D9502F] text-white"
                : "bg-[#D8CBB5] text-[#4A3F33]";
          const isActive = a.id === currentReviewId;
          return (
            <Link
              key={a.id}
              href={`/practice?sessionId=${sessionId}&reviewAttemptId=${a.id}${returnToParam}`}
              title={a.status === "SOLVED" ? "Solved" : a.status === "WRONG" ? "Wrong" : "Not answered"}
              className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-all ${color} ${
                isActive ? "ring-2 ring-[#4C3AA0] ring-offset-2 dark:ring-offset-neutral-900" : ""
              }`}
            >
              {i + 1}
            </Link>
          );
        })}
      </div>

      <div className="mt-4 flex flex-col gap-2 border-t border-[#F0E6D6] pt-3 text-xs dark:border-neutral-800">
        {currentReviewId && (
          <Link
            href={`/practice?sessionId=${sessionId}${returnToParam}`}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-[#FF6B4A] px-3 py-2 font-semibold text-white transition-colors hover:bg-[#D9502F]"
          >
            <RotateCcw size={13} /> Back to Current Question
          </Link>
        )}
        <div className="flex items-center justify-between pt-1">
          {prevAttempt ? (
            <Link href={`/practice?sessionId=${sessionId}&reviewAttemptId=${prevAttempt.id}${returnToParam}`} className="flex items-center gap-1 font-semibold text-[#4C3AA0] dark:text-indigo-400">
              <ChevronLeft size={14} /> Prev Question
            </Link>
          ) : (
            <span />
          )}
          {nextAttempt ? (
            <Link href={`/practice?sessionId=${sessionId}&reviewAttemptId=${nextAttempt.id}${returnToParam}`} className="flex items-center gap-1 font-semibold text-[#4C3AA0] dark:text-indigo-400">
              Next Question <ChevronRight size={14} />
            </Link>
          ) : (
            <span />
          )}
        </div>
      </div>
    </div>
  );
}