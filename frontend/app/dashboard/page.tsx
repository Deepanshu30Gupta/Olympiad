import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { Star, CheckCircle2, ListChecks, Target as TargetIcon, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getActiveSession } from "@/services/session-service";
import {
  getTodaysGoalProgress,
  getCurrentFocusTopic,
  getWeeklyTrends,
  getUserRank,
  getRatingHistory,
  getNextMilestone,
} from "@/services/dashboard-service";
import { DashboardSidebar } from "@/features/dashboard/DashboardSidebar";
import { HeroStreak } from "@/features/dashboard/HeroStreak";
import { getMotivationalMessage } from "@/lib/motivational-message";
import { QuickProgressCard } from "@/features/dashboard/QuickProgressCard";
import { ResumeSessionCard, StartNewPracticeCard } from "@/features/dashboard/ActionCards";
import { LeaderboardPreviewCard } from "@/features/dashboard/LeaderboardPreviewCard";
import { NextMilestoneCard } from "@/features/dashboard/NextMilestoneCard";
import { Sparkline } from "@/features/dashboard/Sparkline";
import { ratingToStars } from "@/lib/rating-display";

function getWeeklyInsight(ratingChange: number | null): string {
  if (ratingChange === null) return "Keep practicing to start seeing weekly trends.";
  if (ratingChange > 0) return "Your rating has improved over the last 7 days.";
  if (ratingChange < 0) return "Your rating dipped slightly this week — a great time for extra practice.";
  return "Your rating held steady this week.";
}

export default async function DashboardPage() {
  const clerkUser = await currentUser();
  if (!clerkUser) return <div className="p-8">Not signed in.</div>;

  const dbUser = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } });
  if (!dbUser) return <div className="p-8">Your account is still syncing. Try refreshing in a moment.</div>;

  const [activeSession, todaysGoal, currentFocus, weeklyTrends, rank, ratingHistory] = await Promise.all([
    getActiveSession(dbUser.id),
    getTodaysGoalProgress(dbUser.id, dbUser.dailyGoal),
    getCurrentFocusTopic(dbUser.id),
    getWeeklyTrends(dbUser.id, dbUser.learnerScore),
    getUserRank(dbUser.id, dbUser.learnerScore),
    getRatingHistory(dbUser.id),
  ]);

  const motivationalMessage = getMotivationalMessage(dbUser.currentStreak, todaysGoal.solvedToday, todaysGoal.dailyGoal);
  const milestone = getNextMilestone(dbUser.learnerScore);
  const weeklyInsight = getWeeklyInsight(weeklyTrends.ratingChangeThisWeek);
  const sparklinePoints = ratingHistory.slice(-7).map((p) => ratingToStars(p.rating));
  const todaysGoalRemaining = Math.max(0, todaysGoal.dailyGoal - todaysGoal.solvedToday);

  let sessionTopicLabel = "a mix of everything";
  if (activeSession && activeSession.topicFocus.length > 0) {
    const topics = await prisma.topic.findMany({ where: { slug: { in: activeSession.topicFocus } }, select: { name: true } });
    if (topics.length > 0) sessionTopicLabel = topics.map((t) => t.name).join(", ");
  }

  const continuePracticeHref = activeSession ? `/practice?sessionId=${activeSession.id}` : "/onboarding";
  const continuePracticeLabel = activeSession ? "Continue Practice" : "Start Practicing";

  return (
    <div className="flex min-h-screen bg-[#FFFBF2] dark:bg-neutral-950">
      <DashboardSidebar todaysGoal={todaysGoal} />

      <div className="min-w-0 flex-1 px-6 py-8 md:px-10">
        <div className="mx-auto max-w-5xl">
          <div className="animate-fade-in-up flex flex-col items-center gap-8 rounded-3xl bg-gradient-to-br from-[#FFF3E0] via-white to-[#FFEDE3] p-10 shadow-sm dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-900 sm:flex-row">
            <HeroStreak streak={dbUser.currentStreak} />
            <div className="flex-1 text-center sm:text-left">
              <h1
                className="text-3xl font-extrabold leading-tight text-[#2B2118] dark:text-neutral-100 sm:text-4xl"
                style={{ fontFamily: "var(--font-fredoka), sans-serif" }}
              >
                👋 Welcome back{dbUser.name ? `, ${dbUser.name}` : ""}!
              </h1>
              <p className="mt-2 flex flex-wrap items-center justify-center gap-2 text-base text-[#6B5D4F] dark:text-neutral-400 sm:justify-start">
                <span className="inline-flex items-center gap-1 text-lg font-bold text-[#4C3AA0] dark:text-indigo-400">
                  <Star size={16} fill="currentColor" /> {dbUser.learnerScore}
                </span>
                current rating
              </p>
              <p className="mt-4 text-base font-semibold text-[#FF6B4A]">{motivationalMessage}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              {activeSession ? (
                <ResumeSessionCard
                  href={`/practice?sessionId=${activeSession.id}`}
                  topicLabel={sessionTopicLabel}
                  questionsCompleted={activeSession.questionsCompleted}
                  startedAt={activeSession.startedAt.toISOString()}
                />
              ) : (
                <StartNewPracticeCard suggestedTopic={currentFocus?.topicName ?? null} />
              )}
            </div>
            <div className="flex flex-col gap-4">
              {activeSession && (
                <div className="scale-[0.96] opacity-90">
                  <StartNewPracticeCard suggestedTopic={currentFocus?.topicName ?? null} />
                </div>
              )}
              <LeaderboardPreviewCard rank={rank} />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <QuickProgressCard
              icon={<Star size={18} className="text-white" />}
              iconBg="#4C3AA0"
              label="Current Rating"
              value={dbUser.learnerScore}
              decimals={1}
              trend={weeklyTrends.ratingChangeThisWeek !== null ? { value: weeklyTrends.ratingChangeThisWeek, label: "this week" } : null}
            />
            <QuickProgressCard icon={<CheckCircle2 size={18} className="text-white" />} iconBg="#2E6B1B" label="Questions Solved" value={dbUser.totalSolved} trend={{ value: weeklyTrends.solvedThisWeek, label: "this week" }} />
            <QuickProgressCard icon={<ListChecks size={18} className="text-white" />} iconBg="#3B7DD8" label="Questions Attempted" value={dbUser.totalAttempted} trend={{ value: weeklyTrends.attemptsThisWeek, label: "this week" }} />

            <div className="rounded-2xl border border-[#F0E6D6] bg-white p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#6FCF52]">
                <TargetIcon size={18} className="text-white" />
              </div>
              <div className="mt-3 text-xs text-[#6B5D4F] dark:text-neutral-500">Today&rsquo;s Goal</div>
              <div className="text-xl font-bold text-[#2B2118] dark:text-neutral-100" style={{ fontFamily: "var(--font-fredoka), sans-serif" }}>
                {todaysGoal.solvedToday} / {todaysGoal.dailyGoal}
              </div>
              <div className="mt-1.5 h-1.5 rounded-full bg-[#F0E6D6] dark:bg-neutral-800">
                <div className="h-1.5 rounded-full bg-[#6FCF52] transition-all duration-500" style={{ width: `${todaysGoal.pct}%` }} />
              </div>
              <div className="mt-1 text-[11px] text-[#6B5D4F] dark:text-neutral-500">
                {todaysGoalRemaining > 0 ? `${todaysGoalRemaining} more to go` : "Goal complete! 🎉"}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <NextMilestoneCard
              target={milestone.target}
              pct={milestone.pct}
              estimatedQuestions={milestone.estimatedQuestions}
              ctaHref={continuePracticeHref}
              ctaLabel={continuePracticeLabel}
            />
          </div>

          <div className="mt-6 rounded-3xl border border-[#F0E6D6]/70 bg-[#FFFBF2]/60 p-6 dark:border-neutral-800/70 dark:bg-neutral-900/40">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-[#2B2118] dark:text-neutral-100" style={{ fontFamily: "var(--font-fredoka), sans-serif" }}>
                  Performance Snapshot
                </h2>
                <p className="text-xs text-[#6B5D4F] dark:text-neutral-500">Last 7 days</p>
              </div>
              <Link href="/progress" className="flex shrink-0 items-center gap-1 text-sm font-semibold text-[#4C3AA0] dark:text-indigo-400">
                View Full Progress <ArrowRight size={14} />
              </Link>
            </div>

            <div className="mt-4 grid gap-5 sm:grid-cols-[140px_1fr]">
              <Sparkline points={sparklinePoints} color={(weeklyTrends.ratingChangeThisWeek ?? 0) >= 0 ? "#2E6B1B" : "#D9502F"} />
              <div>
                <p className="text-sm text-[#2B2118] dark:text-neutral-300">{weeklyInsight}</p>
                <div className="mt-3 grid grid-cols-3 gap-4 text-center sm:text-left">
                  <div>
                    <div className="text-lg font-extrabold text-[#2E6B1B]" style={{ fontFamily: "var(--font-fredoka), sans-serif" }}>{weeklyTrends.solvedThisWeek}</div>
                    <div className="text-xs text-[#6B5D4F] dark:text-neutral-500">Solved</div>
                  </div>
                  <div>
                    <div className={`text-lg font-extrabold ${(weeklyTrends.ratingChangeThisWeek ?? 0) >= 0 ? "text-[#4C3AA0]" : "text-[#D9502F]"}`} style={{ fontFamily: "var(--font-fredoka), sans-serif" }}>
                      {weeklyTrends.ratingChangeThisWeek !== null ? `${weeklyTrends.ratingChangeThisWeek >= 0 ? "+" : ""}${weeklyTrends.ratingChangeThisWeek}` : "—"}
                    </div>
                    <div className="text-xs text-[#6B5D4F] dark:text-neutral-500">This Week</div>
                  </div>
                  <div>
                    <div className="text-lg font-extrabold text-[#FF6B4A]" style={{ fontFamily: "var(--font-fredoka), sans-serif" }}>{weeklyTrends.attemptsThisWeek}</div>
                    <div className="text-xs text-[#6B5D4F] dark:text-neutral-500">Attempted</div>
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