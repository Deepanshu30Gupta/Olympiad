import Link from "next/link";
import { Trophy } from "lucide-react";

function getEncouragement(pct: number): string {
  if (pct >= 80) return "So close — you can almost taste it!";
  if (pct >= 50) return "You're over halfway there — keep the momentum going.";
  if (pct >= 20) return "Good progress — every solve gets you closer.";
  return "Let's get this journey started!";
}

export function NextMilestoneCard({
  target,
  pct,
  estimatedQuestions,
  ctaHref,
  ctaLabel,
}: {
  target: number;
  pct: number;
  estimatedQuestions: number;
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-[#F0E6D6] bg-gradient-to-br from-white via-white to-[#FFF3D6] p-6 dark:border-neutral-800 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-900">
      <Trophy size={90} className="pointer-events-none absolute -bottom-4 -right-4 text-[#FFB238]/10" />

      <div className="relative flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFB238]">
              <Trophy size={16} className="text-white" />
            </span>
            <h2 className="text-base font-bold text-[#2B2118] dark:text-neutral-100" style={{ fontFamily: "var(--font-fredoka), sans-serif" }}>
              Next Milestone: ★ {target}.0
            </h2>
          </div>

          <p className="mt-1.5 text-sm text-[#6B5D4F] dark:text-neutral-400">{getEncouragement(pct)}</p>

          <div className="mt-3 h-2.5 rounded-full bg-[#F0E6D6] dark:bg-neutral-800">
            <div className="h-2.5 rounded-full bg-gradient-to-r from-[#FF6B4A] to-[#FFB238] transition-all duration-700" style={{ width: `${pct}%` }} />
          </div>

          <p className="mt-3 text-sm font-semibold text-[#FF6B4A]">
            🚀 Only {estimatedQuestions} more correct answer{estimatedQuestions !== 1 ? "s" : ""} to reach your next rating!
          </p>
        </div>

        <Link
          href={ctaHref}
          className="shrink-0 rounded-xl bg-[#FF6B4A] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:scale-[1.02] hover:bg-[#D9502F] hover:shadow-lg"
        >
          {ctaLabel} →
        </Link>
      </div>
    </div>
  );
}