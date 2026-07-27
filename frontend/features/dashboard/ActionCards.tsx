import Link from "next/link";
import { Play, PenLine } from "lucide-react";
import { formatRelativeTime } from "@/lib/format-relative-time";

export function ResumeSessionCard({
  href,
  topicLabel,
  questionsCompleted,
  startedAt,
}: {
  href: string;
  topicLabel: string;
  questionsCompleted: number;
  startedAt: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col justify-between rounded-3xl border border-[#F0E6D6] bg-white p-6 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.01] hover:shadow-xl dark:border-neutral-800 dark:bg-neutral-900"
    >
      <div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FF6B4A] transition-transform duration-300 group-hover:scale-110">
          <Play size={18} className="text-white" />
        </div>
        <h3 className="mt-3 text-lg font-bold text-[#2B2118] dark:text-neutral-100" style={{ fontFamily: "var(--font-fredoka), sans-serif" }}>
          Resume Last Session
        </h3>
        <p className="mt-1 text-sm text-[#6B5D4F] dark:text-neutral-400">{topicLabel}</p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-[#6B5D4F] dark:text-neutral-500">
          <span className="rounded-full bg-[#FFFBF2] px-2.5 py-1 dark:bg-neutral-800">
            {questionsCompleted} question{questionsCompleted !== 1 ? "s" : ""} so far
          </span>
          <span className="rounded-full bg-[#FFFBF2] px-2.5 py-1 dark:bg-neutral-800">
            Started {formatRelativeTime(startedAt)}
          </span>
        </div>
      </div>
      <span className="mt-5 inline-flex w-fit items-center gap-1.5 rounded-xl bg-[#FF6B4A] px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 group-hover:bg-[#D9502F] group-hover:shadow-md">
        Resume →
      </span>
    </Link>
  );
}

export function StartNewPracticeCard({ suggestedTopic }: { suggestedTopic: string | null }) {
  return (
    <Link
      href="/onboarding"
      className="group flex flex-col justify-between rounded-3xl bg-gradient-to-br from-[#4C3AA0] to-[#3D2F82] p-6 text-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.01] hover:shadow-xl"
    >
      <div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 transition-transform duration-300 group-hover:scale-110">
          <PenLine size={18} />
        </div>
        <h3 className="mt-3 text-lg font-bold" style={{ fontFamily: "var(--font-fredoka), sans-serif" }}>
          Start New Practice
        </h3>
        <p className="mt-1 text-sm text-white/80">
          {suggestedTopic ? `Suggested: ${suggestedTopic}` : "Choose a topic and get matched to a question"}
        </p>
      </div>
      <span className="mt-5 inline-flex w-fit items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#4C3AA0] transition-all duration-200 group-hover:shadow-md">
        Start Practice →
      </span>
    </Link>
  );
}