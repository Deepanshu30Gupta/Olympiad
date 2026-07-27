import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { Play, PenLine, Flag, TrendingUp, Flame, CheckCircle2, Target } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getActiveSession } from "@/services/session-service";
import {
  getTopicBreakdown,
  getAllSessionsWithStats,
  getRatingHistory,
  getTodaysGoalProgress,
  getActivityHeatmap,
  getCurrentFocusTopic,
  getNextMilestone,
} from "@/services/dashboard-service";
import { TopicCard } from "@/features/dashboard/TopicCard";
import { SessionCard } from "@/features/dashboard/SessionCard";
import { RatingChart } from "@/features/dashboard/RatingChart";
import { CategoryBarChart } from "@/features/dashboard/CategoryBarChart";
import { DashboardSidebar } from "@/features/dashboard/DashboardSidebar";
import { DashboardMascot } from "@/features/dashboard/DashboardMascot";
import { WeeklyHeatmap } from "@/features/dashboard/WeeklyHeatmap";

export default async function DashboardPage() {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    return <div className="p-8">Not signed in.</div>;
  }

  const dbUser = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } });
  if (!dbUser) {
    return <div className="p-8">Your account is still syncing. Try refreshing in a moment.</div>;
  }

  const [activeSession, topicBreakdown, sessions, ratingHistory, todaysGoal, heatmap, currentFocus] =
    await Promise.all([
      getActiveSession(dbUser.id),
      getTopicBreakdown(dbUser.id),
      getAllSessionsWithStats(dbUser.id),
      getRatingHistory(dbUser.id),
      getTodaysGoalProgress(dbUser.id, dbUser.dailyGoal),
      getActivityHeatmap(dbUser.id, 6),
      getCurrentFocusTopic(dbUser.id),
    ]);

  const sessionsForCards = sessions.map((s) => ({ ...s, startedAt: s.startedAt.toISOString() }));
  const stars = dbUser.learnerScore;
  const milestone = getNextMilestone(dbUser.learnerScore);
  const accuracy = dbUser.totalAttempted > 0 ? Math.round((dbUser.totalSolved / dbUser.totalAttempted) * 100) : 0;

  let sessionInsight: string | null = null;
  if (activeSession) {
    let topicLabel = "a mix of everything";
    if (activeSession.topicFocus.length > 0) {
      const topics = await prisma.topic.findMany({
        where: { slug: { in: activeSession.topicFocus } },
        select: { name: true },
      });
      if (topics.length > 0) topicLabel = topics.map((t) => t.name).join(", ");
    }
    sessionInsight = topicLabel;
  }

  return (
    <div className="flex min-h-screen bg-[#FFFBF2] dark:bg-neutral-950">
      <DashboardSidebar />

      <div className="min-w-0 flex-1 px-6 py-8 md:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-3xl border border-[#F0E6D6] bg-white p-7 dark:border-neutral-800 dark:bg-neutral-900 lg:col-span-2">
              <h1
                className="relative inline-block text-3xl font-extrabold text-[#2B2118] dark:text-neutral-100"
                style={{ fontFamily: "var(--font-fredoka), sans-serif" }}
              >
                👋 Welcome back,
                <br />
                <span className="relative text-[#FF6B4A]">
                  {dbUser.name ?? "there"}!
                  <svg viewBox="0 0 90 10" className="absolute -bottom-1 left-0 w-24">
                    <path d="M2 6 Q 12 1 22 6 T 42 6 T 62 6 T 88 6" stroke="#FF6B4A" strokeWidth="3" strokeLinecap="round" fill="none" />
                  </svg>
                </span>
              </h1>
              <p className="mt-4 text-[#6B5D4F] dark:text-neutral-400">
                One more problem.
                <br />
                One step closer.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <StatPill icon={<span className="text-white">★</span>} iconBg="#4C3AA0" label="Current Rating" value={`★ ${stars}`} sub={null} />
                <StatPill icon={<Target size={16} className="text-white" />} iconBg="#FF6B4A" label="Current Focus" value={currentFocus?.topicName ?? "Getting started"} sub={null} />
                <div className="rounded-2xl border border-[#F0E6D6] p-4 dark:border-neutral-800">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6FCF52]">
                      <Target size={16} className="text-white" />
                    </div>
                    <span className="text-xs text-[#6B5D4F] dark:text-neutral-500">Today&rsquo;s Goal</span>
                  </div>
                  <div className="mt-1.5 text-sm font-bold text-[#2B2118] dark:text-neutral-100">
                    Solve {todaysGoal.dailyGoal} Problems
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1.5 flex-1 rounded-full bg-[#F0E6D6] dark:bg-neutral-800">
                      <div className="h-1.5 rounded-full bg-[#6FCF52]" style={{ width: `${todaysGoal.pct}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-[#6B5D4F] dark:text-neutral-400">
                      {todaysGoal.solvedToday} / {todaysGoal.dailyGoal}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center rounded-3xl border border-[#F0E6D6] bg-gradient-to-br from-[#FFF3E0] to-[#FFE8E0] p-4 dark:border-neutral-800 dark:bg-neutral-900">
              <DashboardMascot />
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {activeSession ? (
              <ActionCard icon={<Play size={20} className="text-white" />} iconBg="#FF6B4A" title="Continue Session" body={sessionInsight ? `Resume — ${sessionInsight}` : "Resume your active session"} cta="Resume" href={`/practice?sessionId=${activeSession.id}`} />
            ) : (
              <ActionCard icon={<Play size={20} className="text-white" />} iconBg="#FF6B4A" title="Start a Session" body="No active session right now — start a new one" cta="Start" href="/onboarding" />
            )}
            <ActionCard icon={<PenLine size={20} className="text-white" />} iconBg="#4C3AA0" title="Practice Now" body="Start an adaptive practice session" cta="Start Practice" href="/onboarding" />
            <ActionCard
              icon={<Flag size={20} className="text-white" />}
              iconBg="#2E6B1B"
              title="Daily Challenge"
              body={currentFocus ? `Suggested focus today: ${currentFocus.topicName}` : "Pick a topic and start your first challenge"}
              cta="Solve Now"
              href="/onboarding"
            />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <MiniStat icon={<TrendingUp size={20} className="text-white" />} iconBg="#4C3AA0" label="Overall Rating" value={`★ ${stars}`} />
            <MiniStat icon={<Flame size={20} className="text-white" />} iconBg="#FF6B4A" label="Current Streak" value={`${dbUser.currentStreak} Days`} sub="Keep it alive! 🔥" />
            <MiniStat icon={<CheckCircle2 size={20} className="text-white" />} iconBg="#2E6B1B" label="Problems Solved" value={String(dbUser.totalSolved)} />
            <MiniStat icon={<Target size={20} className="text-white" />} iconBg="#3B7DD8" label="Accuracy" value={`${accuracy}%`} />
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="rounded-3xl border border-[#F0E6D6] bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
              <h2 className="text-base font-bold text-[#2B2118] dark:text-neutral-100">Weekly Activity</h2>
              <p className="text-xs text-[#6B5D4F] dark:text-neutral-500">Your practice heatmap</p>
              <div className="mt-4 overflow-x-auto">
                <WeeklyHeatmap days={heatmap.days} />
              </div>
              <p className="mt-4 text-xs text-[#6B5D4F] dark:text-neutral-500">
                Practiced {heatmap.activeDaysLast7} of last 7 days
              </p>
            </div>

            <div className="rounded-3xl border border-[#F0E6D6] bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
              <h2 className="text-base font-bold text-[#2B2118] dark:text-neutral-100">⭐ Next Milestone</h2>
              <p className="mt-1 text-xs text-[#6B5D4F] dark:text-neutral-500">Reach Rating ★ {milestone.target}.0</p>
              <div className="mt-4 h-2.5 rounded-full bg-[#F0E6D6] dark:bg-neutral-800">
                <div className="h-2.5 rounded-full bg-[#FF6B4A]" style={{ width: `${milestone.pct}%` }} />
              </div>
              <p className="mt-1.5 text-right text-xs font-semibold text-[#2B2118] dark:text-neutral-300">{milestone.pct}%</p>
              <p className="mt-3 rounded-xl bg-[#FFF3E0] p-3 text-xs text-[#6B5D4F] dark:bg-neutral-800 dark:text-neutral-400">
                💡 Estimated: ~{milestone.estimatedQuestions} more well-solved questions (rough estimate, not a guarantee)
              </p>
            </div>
          </div>

          <Section title="Rating over time">
            <Card>
              <RatingChart points={ratingHistory} />
            </Card>
          </Section>

          <Section title="Rating by topic">
            <Card>
              <CategoryBarChart data={topicBreakdown.map((t) => ({ categoryName: t.categoryName, rating: t.rating }))} />
            </Card>
          </Section>

          <Section title="Topic breakdown">
            <div className="flex flex-col gap-3">
              {topicBreakdown.map((t) => (
                <TopicCard
                  key={t.categoryId}
                  categoryName={t.categoryName}
                  rating={t.rating}
                  solved={t.solved}
                  wrong={t.wrong}
                  surrendered={t.surrendered}
                  totalTimeSeconds={t.totalTimeSeconds}
                  attempts={t.attempts.map((a) => ({
                    ...a,
                    submittedAt: a.submittedAt ? a.submittedAt.toISOString() : null,
                  }))}
                />
              ))}
            </div>
          </Section>

          <Section title={`Session history (${sessions.length})`}>
            {sessions.length === 0 ? (
              <Card>
                <p className="text-sm text-[#6B5D4F] dark:text-neutral-400">
                  No sessions yet — start your first one above.
                </p>
              </Card>
            ) : (
              <div className="flex flex-col gap-3">
                {sessionsForCards.map((s) => (
                  <SessionCard key={s.id} {...s} />
                ))}
              </div>
            )}
          </Section>
        </div>
      </div>
    </div>
  );
}

function StatPill({ icon, iconBg, label, value, sub }: { icon: React.ReactNode; iconBg: string; label: string; value: string; sub: string | null }) {
  return (
    <div className="rounded-2xl border border-[#F0E6D6] p-4 dark:border-neutral-800">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: iconBg }}>
          {icon}
        </div>
        <span className="text-xs text-[#6B5D4F] dark:text-neutral-500">{label}</span>
      </div>
      <div className="mt-1.5 text-sm font-bold text-[#2B2118] dark:text-neutral-100">{value}</div>
      {sub && <div className="text-xs text-[#2E6B1B]">{sub}</div>}
    </div>
  );
}

function ActionCard({ icon, iconBg, title, body, cta, href }: { icon: React.ReactNode; iconBg: string; title: string; body: string; cta: string; href: string }) {
  return (
    <Link href={href} className="group rounded-3xl border border-[#F0E6D6] bg-white p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: iconBg }}>
        {icon}
      </div>
      <h3 className="mt-3 font-bold text-[#2B2118] dark:text-neutral-100">{title}</h3>
      <p className="mt-1 text-xs text-[#6B5D4F] dark:text-neutral-400">{body}</p>
      <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#FF6B4A]">{cta} →</span>
    </Link>
  );
}

function MiniStat({ icon, iconBg, label, value, sub }: { icon: React.ReactNode; iconBg: string; label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-[#F0E6D6] bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: iconBg }}>
        {icon}
      </div>
      <div className="mt-3 text-xs text-[#6B5D4F] dark:text-neutral-500">{label}</div>
      <div className="text-xl font-bold text-[#2B2118] dark:text-neutral-100" style={{ fontFamily: "var(--font-fredoka), sans-serif" }}>
        {value}
      </div>
      {sub && <div className="text-xs text-[#2E6B1B]">{sub}</div>}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-8">
      <h2 className="mb-3 text-lg font-semibold text-[#2B2118] dark:text-neutral-100" style={{ fontFamily: "var(--font-fredoka), sans-serif" }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#F0E6D6] bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      {children}
    </div>
  );
}