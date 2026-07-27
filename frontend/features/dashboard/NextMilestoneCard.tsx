import Link from "next/link";

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
    <div className="rounded-3xl border border-[#F0E6D6] bg-gradient-to-br from-white to-[#FFF9EC] p-6 dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-900">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex-1">
          <h2 className="text-base font-bold text-[#2B2118] dark:text-neutral-100" style={{ fontFamily: "var(--font-fredoka), sans-serif" }}>
            ⭐ Next Milestone
          </h2>
          <p className="mt-0.5 text-sm text-[#6B5D4F] dark:text-neutral-400">Reach Rating ★ {target}.0</p>

          <div className="mt-3 h-2.5 rounded-full bg-[#F0E6D6] dark:bg-neutral-800">
            <div className="h-2.5 rounded-full bg-[#FF6B4A] transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>

          <p className="mt-3 text-sm font-semibold text-[#FF6B4A]">
            Only {estimatedQuestions} more correct answer{estimatedQuestions !== 1 ? "s" : ""} to reach your next rating!
          </p>
        </div>

        <Link
          href={ctaHref}
          className="shrink-0 rounded-xl bg-[#FF6B4A] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#D9502F] hover:shadow-md"
        >
          {ctaLabel} →
        </Link>
      </div>
    </div>
  );
}