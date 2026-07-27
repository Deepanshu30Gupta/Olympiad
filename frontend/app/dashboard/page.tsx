import { currentUser } from "@clerk/nextjs/server";
import { Star, CheckCircle2, Target as TargetIcon, ListChecks } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getActiveSession } from "@/services/session-service";
import {
  getRatingHistory,
  getTodaysGoalProgress,
  getCurrentFocusTopic,
  getWeeklyTrends,
} from "@/services/dashboard-service";
import { DashboardSidebar } from "@/features/dashboard/DashboardSidebar";
import { HeroStreak } from "@/features/dashboard/HeroStreak";
import { getMotivationalMessage } from "@/lib/motivational-message";
import { QuickProgressCard } from "@/features/dashboard/QuickProgressCard";
import { ResumeSessionCard, StartNewPracticeCard } from "@/features/dashboard/ActionCards";
import { RatingChart } from "@/features/dashboard/RatingChart";

export default async function DashboardPage() {
  const clerkUser = await currentUser();
  if (!clerkUser) return <div className="p-8">Not signed in.</div>;

  const dbUser = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } });
  if (!dbUser) return <div className="p-8">Your account is still syncing. Try refreshing in a moment.</div>;

  const [activeSession, ratingHistory, todaysGoal, currentFocus, weeklyTrends] = await Promise.all([
    getActiveSession(dbUser.id),
    getRatingHistory(dbUser.id),
    getTodaysGoalProgress(dbUser.id, dbUser.dailyGoal),
    getCurrentFocusTopic(dbUser.id),
    getWeeklyTrends(dbUser.id, dbUser.learnerScore),
  ]);

  const accuracy = dbUser.totalAttempted > 0 ? Math.round((dbUser.totalSolved / dbUser.totalAttempted) * 100) : 0;
  const motivationalMessage = getMotivationalMessage(dbUser.currentStreak, todaysGoal.solvedToday, todaysGoal.dailyGoal);

  let sessionTopicLabel = "a mix of everything";
  let startedMinutesAgo = 0;
  if (activeSession) {
    if (activeSession.topicFocus.length > 0) {
      const topics = await prisma.topic.findMany({
        where: { slug: { in: activeSession.topicFocus } },
        select: { name: true },
      });
      if (topics.length > 0) sessionTopicLabel = topics.map((t) => t.name).join(", ");
    }
    startedMinutesAgo = Math.max(0, Math.round((Date.now() - activeSession.startedAt.getTime()) / 60000));
  }

  return (
    <div className="flex min-h-screen bg-[#FFFBF2] dark:bg-neutral-950">
      <DashboardSidebar />

      <div className="min-w-0 flex-1 px-6 py-8 md:px-10">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col items-center gap-6 rounded-3xl border border-[#F0E6D6] bg-white p-7 dark:border-neutral-800 dark:bg-neutral-900 sm:flex-row">
            <HeroStreak streak={dbUser.currentStreak} />
            <div className="flex-1 text-center sm:text-left">
              <h1
                className="text-2xl font-extrabold text-[#2B2118] dark:text-neutral-100"
                style={{ fontFamily: "var(--font-fredoka), sans-serif" }}
              >
                👋 Welcome back{dbUser.name ? `, ${dbUser.name}` : ""}!
              </h1>
              <p className="mt-1 flex flex-wrap items-center justify-center gap-2 text-sm text-[#6B5D4F] dark:text-neutral-400 sm:justify-start">
                <span className="inline-flex items-center gap-1 font-bold text-[#4C3AA0] dark:text-indigo-400">
                  <Star size={14} fill="currentColor" /> {dbUser.learnerScore}
                </span>
                current rating
              </p>
              <p className="mt-3 text-sm font-medium text-[#FF6B4A]">{motivationalMessage}</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <QuickProgressCard
              icon={<Star size={18} className="text-white" />}
              iconBg="#4C3AA0"
              label="Current Rating"
              value={dbUser.learnerScore}
              decimals={1}
              trend={weeklyTrends.ratingChangeThisWeek !== null ? { value: weeklyTrends.ratingChangeThisWeek, label: "this week" } : null}
            />
            <QuickProgressCard
              icon={<CheckCircle2 size={18} className="text-white" />}
              iconBg="#2E6B1B"
              label="Questions Solved"
              value={dbUser.totalSolved}
              trend={{ value: weeklyTrends.solvedThisWeek, label: "this week" }}
            />
            <QuickProgressCard
              icon={<ListChecks size={18} className="text-white" />}
              iconBg="#3B7DD8"
              label="Questions Attempted"
              value={dbUser.totalAttempted}
              trend={{ value: weeklyTrends.attemptsThisWeek, label: "this week" }}
            />
            <QuickProgressCard
              icon={<TargetIcon size={18} className="text-white" />}
              iconBg="#FF6B4A"
              label="Accuracy"
              value={accuracy}
              suffix="%"
              trend={null}
            />
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {activeSession ? (
              <ResumeSessionCard
                href={`/practice?sessionId=${activeSession.id}`}
                topicLabel={sessionTopicLabel}
                questionsCompleted={activeSession.questionsCompleted}
                startedMinutesAgo={startedMinutesAgo}
              />
            ) : (
              <StartNewPracticeCard suggestedTopic={currentFocus?.topicName ?? null} />
            )}
            <StartNewPracticeCard suggestedTopic={activeSession ? currentFocus?.topicName ?? null : null} />
          </div>

          <div className="mt-5 rounded-3xl border border-[#F0E6D6] bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="text-base font-bold text-[#2B2118] dark:text-neutral-100" style={{ fontFamily: "var(--font-fredoka), sans-serif" }}>
              Rating Over Time
            </h2>
            <p className="text-xs text-[#6B5D4F] dark:text-neutral-500">
              For deeper analytics — accuracy trends, weekly activity, monthly growth — visit the Progress page.
            </p>
            <div className="mt-4">
              <RatingChart points={ratingHistory} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}