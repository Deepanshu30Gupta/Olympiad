import { currentUser } from "@clerk/nextjs/server";
import { Flame, Trophy } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { DashboardSidebar } from "@/features/dashboard/DashboardSidebar";
import { LeaderboardSection } from "@/features/dashboard/LeaderboardSection";

const RANK_COLORS = ["#FFB238", "#B0B0B0", "#CD7F32"];

async function getRankedList(orderBy: "currentStreak" | "learnerScore") {
  const users = await prisma.user.findMany({
    where: orderBy === "currentStreak" ? { currentStreak: { gt: 0 } } : undefined,
    orderBy: { [orderBy]: "desc" },
    select: { id: true, name: true, email: true, currentStreak: true, learnerScore: true },
  });
  return users;
}

function displayName(name: string | null, email: string): string {
  if (name) return name;
  return email.split("@")[0];
}

export default async function LeaderboardPage() {
  const clerkUser = await currentUser();
  const dbUser = clerkUser ? await prisma.user.findUnique({ where: { clerkId: clerkUser.id } }) : null;

  const [streakList, ratingList] = await Promise.all([
    getRankedList("currentStreak"),
    getRankedList("learnerScore"),
  ]);

  const streakEntries = streakList.map((u) => ({ id: u.id, name: displayName(u.name, u.email), value: `${u.currentStreak} day${u.currentStreak !== 1 ? "s" : ""}` }));
  const ratingEntries = ratingList.map((u) => ({ id: u.id, name: displayName(u.name, u.email), value: `★ ${u.learnerScore}` }));

  const myStreakRank = dbUser ? streakList.findIndex((u) => u.id === dbUser.id) + 1 : 0;
  const myRatingRank = dbUser ? ratingList.findIndex((u) => u.id === dbUser.id) + 1 : 0;

  return (
    <div className="flex min-h-screen bg-[#FFFBF2] dark:bg-neutral-950">
      <DashboardSidebar />
      <div className="min-w-0 flex-1 px-6 py-8 md:px-10">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-2xl font-extrabold text-[#2B2118] dark:text-neutral-100" style={{ fontFamily: "var(--font-fredoka), sans-serif" }}>
            🏆 Leaderboard
          </h1>
          <p className="mt-1 text-sm text-[#6B5D4F] dark:text-neutral-400">
            See who's training the hardest and climbing the fastest.
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <LeaderboardSection
              title="Top Streaks"
              icon={<Flame size={20} color="#FF6B4A" />}
              entries={streakEntries}
              rankColors={RANK_COLORS}
              accent="#FF6B4A"
              emptyMessage="No active streaks yet — be the first!"
              myRank={myStreakRank > 0 ? myStreakRank : null}
              myValue={dbUser ? `${dbUser.currentStreak} day${dbUser.currentStreak !== 1 ? "s" : ""}` : null}
            />
            <LeaderboardSection
              title="Top Ratings"
              icon={<Trophy size={20} color="#4C3AA0" />}
              entries={ratingEntries}
              rankColors={RANK_COLORS}
              accent="#4C3AA0"
              emptyMessage="No ratings yet — start practicing to appear here!"
              myRank={myRatingRank > 0 ? myRatingRank : null}
              myValue={dbUser ? `★ ${dbUser.learnerScore}` : null}
            />
          </div>
        </div>
      </div>
    </div>
  );
}