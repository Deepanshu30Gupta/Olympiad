import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import {
  getTopicBreakdown,
  getRatingHistory,
  getTodaysGoalProgress,
  getAverageTimePerQuestion,
  getWeeklyTrends,
} from "@/services/dashboard-service";
import { DashboardSidebar } from "@/features/dashboard/DashboardSidebar";
import { RatingChart } from "@/features/dashboard/RatingChart";
import { CategoryBarChart } from "@/features/dashboard/CategoryBarChart";
import { ActivityCalendar } from "@/features/dashboard/ActivityCalendar";

export default async function ProgressPage() {
  const clerkUser = await currentUser();
  if (!clerkUser) return <div className="p-8">Not signed in.</div>;

  const dbUser = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } });
  if (!dbUser) return <div className="p-8">Your account is still syncing. Try refreshing in a moment.</div>;

  const [topicBreakdown, ratingHistory, todaysGoal, avgTimeSeconds, weeklyTrends] = await Promise.all([
    getTopicBreakdown(dbUser.id),
    getRatingHistory(dbUser.id),
    getTodaysGoalProgress(dbUser.id, dbUser.dailyGoal),
    getAverageTimePerQuestion(dbUser.id),
    getWeeklyTrends(dbUser.id, dbUser.learnerScore),
  ]);

  const avgMinutes = Math.floor(avgTimeSeconds / 60);
  const avgSeconds = avgTimeSeconds % 60;
  const avgTimeLabel = avgMinutes > 0 ? `${avgMinutes}m ${avgSeconds}s` : `${avgSeconds}s`;

  const accuracy = dbUser.totalAttempted > 0 ? Math.round((dbUser.totalSolved / dbUser.totalAttempted) * 100) : 0;

  return (
    <div className="flex min-h-screen bg-[#FFFBF2] dark:bg-neutral-950">
      <DashboardSidebar />
      <div className="min-w-0 flex-1 px-6 py-8 md:px-10">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-2xl font-extrabold text-[#2B2118] dark:text-neutral-100" style={{ fontFamily: "var(--font-fredoka), sans-serif" }}>
            📈 Progress
          </h1>
          <p className="mt-1 text-sm text-[#6B5D4F] dark:text-neutral-400">
            The full picture — every trend behind your rating.
          </p>

          <Card title="Rating Over Time" className="mt-6">
            <RatingChart points={ratingHistory} />
          </Card>

          <Card title="Rating by Topic" className="mt-5">
            <CategoryBarChart
              data={topicBreakdown
                .filter((t) => t.solved + t.wrong + t.surrendered > 0)
                .map((t) => ({ categoryName: t.categoryName, stars: t.displayScore }))}
            />
          </Card>

          <div className="mt-5 rounded-3xl border border-[#F0E6D6] bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="grid gap-6 lg:grid-cols-[7fr_3fr] lg:divide-x lg:divide-[#F0E6D6] dark:lg:divide-neutral-800">
              <div className="lg:pr-6">
                <ActivityCalendar joinDate={dbUser.createdAt.toISOString()} />
              </div>

              <div className="lg:pl-6">
                <h2 className="text-base font-bold text-[#2B2118] dark:text-neutral-100" style={{ fontFamily: "var(--font-fredoka), sans-serif" }}>
                  Performance Summary
                </h2>
                <div className="mt-4 flex flex-col divide-y divide-[#F0E6D6] dark:divide-neutral-800">
                  <div className="py-3 first:pt-0">
                    <div className="text-2xl font-extrabold text-[#2E6B1B]" style={{ fontFamily: "var(--font-fredoka), sans-serif" }}>
                      {dbUser.totalSolved}
                    </div>
                    <div className="text-xs text-[#6B5D4F] dark:text-neutral-500">Solved</div>
                  </div>
                  <div className="py-3">
                    <div className="text-2xl font-extrabold text-[#FF6B4A]" style={{ fontFamily: "var(--font-fredoka), sans-serif" }}>
                      {accuracy}%
                    </div>
                    <div className="text-xs text-[#6B5D4F] dark:text-neutral-500">Accuracy</div>
                  </div>
                  <div className="py-3">
                    <div className="text-2xl font-extrabold text-[#4C3AA0]" style={{ fontFamily: "var(--font-fredoka), sans-serif" }}>
                      {avgTimeLabel}
                    </div>
                    <div className="text-xs text-[#6B5D4F] dark:text-neutral-500">Average Time</div>
                  </div>
                  <div className="py-3 last:pb-0">
                    <div
                      className={`text-2xl font-extrabold ${(weeklyTrends.ratingChangeThisWeek ?? 0) >= 0 ? "text-[#2E6B1B]" : "text-[#D9502F]"}`}
                      style={{ fontFamily: "var(--font-fredoka), sans-serif" }}
                    >
                      {weeklyTrends.ratingChangeThisWeek !== null
                        ? `${weeklyTrends.ratingChangeThisWeek >= 0 ? "+" : ""}${weeklyTrends.ratingChangeThisWeek}`
                        : "—"}
                    </div>
                    <div className="text-xs text-[#6B5D4F] dark:text-neutral-500">Rating Change (7d)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-3xl border border-[#F0E6D6] bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900 ${className}`}>
      <h2 className="mb-4 text-base font-bold text-[#2B2118] dark:text-neutral-100" style={{ fontFamily: "var(--font-fredoka), sans-serif" }}>
        {title}
      </h2>
      {children}
    </div>
  );
}