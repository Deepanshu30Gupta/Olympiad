import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getTopicBreakdown, getCategoryQuestionCounts, getMasteryLevel } from "@/services/dashboard-service";
import { ratingToStars } from "@/lib/rating-display";
import { DashboardSidebar } from "@/features/dashboard/DashboardSidebar";
import { TopicsPageCard } from "@/features/dashboard/TopicsPageCard";

const MASTERY_ORDER = ["Mastered", "Advanced", "Intermediate", "Beginner"] as const;

export default async function TopicsPage() {
  const clerkUser = await currentUser();
  if (!clerkUser) return <div className="p-8">Not signed in.</div>;

  const dbUser = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } });
  if (!dbUser) return <div className="p-8">Your account is still syncing. Try refreshing in a moment.</div>;

  const [topicBreakdown, questionCounts] = await Promise.all([
    getTopicBreakdown(dbUser.id),
    getCategoryQuestionCounts(),
  ]);

  const startedTopics = topicBreakdown.filter((t) => t.solved + t.wrong + t.surrendered > 0);

  const grouped = MASTERY_ORDER.map((level) => ({
    level,
    topics: startedTopics.filter((t) => getMasteryLevel(ratingToStars(t.rating)) === level),
  })).filter((g) => g.topics.length > 0);

  return (
    <div className="flex min-h-screen bg-[#FFFBF2] dark:bg-neutral-950">
      <DashboardSidebar />
      <div className="min-w-0 flex-1 px-6 py-8 md:px-10">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-2xl font-extrabold text-[#2B2118] dark:text-neutral-100" style={{ fontFamily: "var(--font-fredoka), sans-serif" }}>
            📚 Topics
          </h1>
          <p className="mt-1 text-sm text-[#6B5D4F] dark:text-neutral-400">
            Topics you&rsquo;ve started, grouped by mastery level. Untouched topics stay hidden until you begin them.
          </p>

          {grouped.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-[#F0E6D6] bg-white p-8 text-center dark:border-neutral-800 dark:bg-neutral-900">
              <p className="text-sm text-[#6B5D4F] dark:text-neutral-400">
                You haven&rsquo;t started any topics yet — head to Practice to begin.
              </p>
            </div>
          ) : (
            grouped.map((group) => (
              <div key={group.level} className="mt-8">
                <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-[#6B5D4F] dark:text-neutral-500">
                  {group.level}
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {group.topics.map((t) => (
                    <TopicsPageCard
                      key={t.categoryId}
                      categoryName={t.categoryName}
                      stars={ratingToStars(t.rating)}
                      solved={t.solved}
                      wrong={t.wrong}
                      totalQuestions={questionCounts.get(t.categoryId) ?? 0}
                      completed={t.solved + t.wrong + t.surrendered}
                      mistakes={t.attempts.filter((a) => a.status === "WRONG").slice(0, 3)}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}