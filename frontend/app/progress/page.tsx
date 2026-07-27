import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import {
  getTopicBreakdown,
  getRatingHistory,
  getTodaysGoalProgress,
  getActivityHeatmap,
} from "@/services/dashboard-service";
import { DashboardSidebar } from "@/features/dashboard/DashboardSidebar";
import { RatingChart } from "@/features/dashboard/RatingChart";
import { CategoryBarChart } from "@/features/dashboard/CategoryBarChart";
import { WeeklyHeatmap } from "@/features/dashboard/WeeklyHeatmap";

export default async function ProgressPage() {
  const clerkUser = await currentUser();
  if (!clerkUser) return <div className="p-8">Not signed in.</div>;

  const dbUser = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } });
  if (!dbUser) return <div className="p-8">Your account is still syncing. Try refreshing in a moment.</div>;

  const [topicBreakdown, ratingHistory, heatmap, todaysGoal] = await Promise.all([
    getTopicBreakdown(dbUser.id),
    getRatingHistory(dbUser.id),
    getActivityHeatmap(dbUser.id, 8),
    getTodaysGoalProgress(dbUser.id, dbUser.dailyGoal),
  ]);

  const accuracy = dbUser.totalAttempted > 0 ? Math.round((dbUser.totalSolved / dbUser.totalAttempted) * 100) : 0;

  return (
    <div className="flex min-h-screen bg-[#FFFBF2] dark:bg-neutral-950">
      <DashboardSidebar todaysGoal={todaysGoal} />
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
            <CategoryBarChart data={topicBreakdown.map((t) => ({ categoryName: t.categoryName, rating: t.rating }))} />
          </Card>

          <div className="mt-5 grid gap-5 lg:grid-cols-[7fr_3fr]">
            <Card title="Weekly Activity">
              <p className="text-xs text-[#6B5D4F] dark:text-neutral-500">Your practice habits at a glance</p>
              <div className="mt-4 overflow-x-auto">
                <WeeklyHeatmap days={heatmap.days} />
              </div>
              <p className="mt-5 border-t border-[#F0E6D6] pt-4 text-sm text-[#2B2118] dark:border-neutral-800 dark:text-neutral-300">
                Practiced <span className="font-bold">{heatmap.activeDaysLast7}</span> of the last 7 days
              </p>
            </Card>

            <Card title="Performance Summary">
              <div className="flex flex-col divide-y divide-[#F0E6D6] dark:divide-neutral-800">
                <div className="pb-4">
                  <div className="text-2xl font-extrabold text-[#2E6B1B]" style={{ fontFamily: "var(--font-fredoka), sans-serif" }}>
                    {dbUser.totalSolved}
                  </div>
                  <div className="text-xs text-[#6B5D4F] dark:text-neutral-500">Solved</div>
                </div>
                <div className="py-4">
                  <div className="text-2xl font-extrabold text-[#3B7DD8]" style={{ fontFamily: "var(--font-fredoka), sans-serif" }}>
                    {dbUser.totalAttempted}
                  </div>
                  <div className="text-xs text-[#6B5D4F] dark:text-neutral-500">Attempted</div>
                </div>
                <div className="pt-4">
                  <div className="text-2xl font-extrabold text-[#FF6B4A]" style={{ fontFamily: "var(--font-fredoka), sans-serif" }}>
                    {accuracy}%
                  </div>
                  <div className="text-xs text-[#6B5D4F] dark:text-neutral-500">Accuracy</div>
                </div>
              </div>
            </Card>
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