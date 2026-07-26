import { Flame, Trophy } from "lucide-react";
import { prisma } from "@/lib/prisma";

const RANK_COLORS = ["#FFB238", "#B0B0B0", "#CD7F32"]; // gold, silver, bronze

export default async function LeaderboardPage() {
  const [topStreaks, topRatings] = await Promise.all([
    prisma.user.findMany({
      where: { currentStreak: { gt: 0 } },
      orderBy: { currentStreak: "desc" },
      take: 15,
      select: { id: true, name: true, email: true, currentStreak: true },
    }),
    prisma.user.findMany({
      orderBy: { learnerScore: "desc" },
      take: 15,
      select: { id: true, name: true, email: true, learnerScore: true },
    }),
  ]);

  return (
    <div className="min-h-screen bg-[#FFFBF2] dark:bg-neutral-950">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <h1
          className="text-center text-4xl font-extrabold text-[#2B2118] dark:text-neutral-100"
          style={{ fontFamily: "var(--font-fredoka), sans-serif" }}
        >
          Leaderboard
        </h1>
        <p className="mt-2 text-center text-sm text-[#6B5D4F] dark:text-neutral-400">
          See who's training the hardest and climbing the fastest.
        </p>

        <div className="mt-10 grid gap-8 md:grid-cols-2">
          <LeaderboardCard
            title="Top Streaks"
            icon={<Flame size={20} color="#FF6B4A" />}
            entries={topStreaks.map((u) => ({
              id: u.id,
              name: displayName(u.name, u.email),
              value: `${u.currentStreak} day${u.currentStreak !== 1 ? "s" : ""}`,
            }))}
            emptyMessage="No active streaks yet — be the first!"
            accent="#FF6B4A"
          />
          <LeaderboardCard
            title="Top Ratings"
            icon={<Trophy size={20} color="#4C3AA0" />}
            entries={topRatings.map((u) => ({
              id: u.id,
              name: displayName(u.name, u.email),
              value: `★ ${u.learnerScore}`,
            }))}
            emptyMessage="No ratings yet — start practicing to appear here!"
            accent="#4C3AA0"
          />
        </div>
      </div>
    </div>
  );
}

function displayName(name: string | null, email: string): string {
  if (name) return name;
  return email.split("@")[0];
}

function LeaderboardCard({
  title,
  icon,
  entries,
  emptyMessage,
  accent,
}: {
  title: string;
  icon: React.ReactNode;
  entries: { id: string; name: string; value: string }[];
  emptyMessage: string;
  accent: string;
}) {
  return (
    <div className="rounded-3xl border border-[#F0E6D6] bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center gap-2">
        {icon}
        <h2
          className="text-lg font-bold text-[#2B2118] dark:text-neutral-100"
          style={{ fontFamily: "var(--font-fredoka), sans-serif" }}
        >
          {title}
        </h2>
      </div>

      {entries.length === 0 ? (
        <p className="mt-6 text-sm text-[#6B5D4F] dark:text-neutral-400">{emptyMessage}</p>
      ) : (
        <div className="mt-5 flex flex-col gap-1.5">
          {entries.map((entry, i) => (
            <div
              key={entry.id}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-[#FFFBF2] dark:hover:bg-neutral-800"
            >
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: i < 3 ? RANK_COLORS[i] : "#D8CBB5" }}
              >
                {i + 1}
              </span>
              <span className="flex-1 truncate text-sm font-medium text-[#2B2118] dark:text-neutral-200">
                {entry.name}
              </span>
              <span className="text-sm font-bold" style={{ color: accent }}>
                {entry.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}