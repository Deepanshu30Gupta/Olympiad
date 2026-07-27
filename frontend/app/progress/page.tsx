import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import {
  getTopicBreakdown,
  getRatingHistory,
  getActivityHeatmap,
  getNextMilestone,
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

  const [topicBreakdown, ratingHistory, heatmap] = await Promise.all([
    getTopicBreakdown(dbUser.id),
    getRatingHistory(dbUser.id),
    getActivityHeatmap(dbUser.id, 8),
  ]);

  const milestone = getNextMilestone(dbUser.learnerScore);
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
            <CategoryBarChart data={topicBreakdown.map((t) => ({ categoryName: t.categoryName, rating: t.rating }))} />
          </Card>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <Card title="Weekly Activity">
              <div className="overflow-x-auto">
                <WeeklyHeatmap days={heatmap.days} />
              </div>
              <p className="mt-4 text-xs text-[#6B5D4F] dark:text-neutral-500">
                Practiced {heatmap.activeDaysLast7} of last 7 days
              </p>
            </Card>

            <Card title="Solved vs Attempted">
              <div className="flex items-center gap-6">
                <div>
                  <div className="text-3xl font-extrabold text-[#2E6B1B]" style={{ fontFamily: "var(--font-fredoka), sans-serif" }}>
                    {dbUser.totalSolved}
                  </div>
                  <div className="text-xs text-[#6B5D4F] dark:text-neutral-500">Solved</div>
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-[#3B7DD8]" style={{ fontFamily: "var(--font-fredoka), sans-serif" }}>
                    {dbUser.totalAttempted}
                  </div>
                  <div className="text-xs text-[#6B5D4F] dark:text-neutral-500">Attempted</div>
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-[#FF6B4A]" style={{ fontFamily: "var(--font-fredoka), sans-serif" }}>
                    {accuracy}%
                  </div>
                  <div className="text-xs text-[#6B5D4F] dark:text-neutral-500">Accuracy</div>
                </div>
              </div>
            </Card>
          </div>

          <Card title="⭐ Next Milestone" className="mt-5">
            <p className="text-xs text-[#6B5D4F] dark:text-neutral-500">Reach Rating ★ {milestone.target}.0</p>
            <div className="mt-3 h-2.5 rounded-full bg-[#F0E6D6] dark:bg-neutral-800">
              <div className="h-2.5 rounded-full bg-[#FF6B4A]" style={{ width: `${milestone.pct}%` }} />
            </div>
            <p className="mt-1.5 text-right text-xs font-semibold text-[#2B2118] dark:text-neutral-300">{milestone.pct}%</p>
            <p className="mt-3 rounded-xl bg-[#FFF3E0] p-3 text-xs text-[#6B5D4F] dark:bg-neutral-800 dark:text-neutral-400">
              💡 Estimated: ~{milestone.estimatedQuestions} more well-solved questions (rough estimate, not a guarantee)
            </p>
          </Card>
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