import Link from "next/link";
import { Trophy } from "lucide-react";

export function LeaderboardPreviewCard({ rank }: { rank: number }) {
  return (
    <Link
      href="/leaderboard"
      className="flex items-center gap-3 rounded-2xl border border-[#F0E6D6] bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFB238]">
        <Trophy size={18} className="text-white" />
      </div>
      <div className="flex-1">
        <div className="text-xs text-[#6B5D4F] dark:text-neutral-500">Your Rank</div>
        <div className="text-lg font-bold text-[#2B2118] dark:text-neutral-100" style={{ fontFamily: "var(--font-fredoka), sans-serif" }}>
          #{rank}
        </div>
      </div>
      <span className="text-xs font-semibold text-[#4C3AA0] dark:text-indigo-400">View →</span>
    </Link>
  );
}