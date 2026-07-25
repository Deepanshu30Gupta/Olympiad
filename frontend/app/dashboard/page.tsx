import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getActiveSession } from "@/services/session-service";
import { getTopicBreakdown, getAllSessionsWithStats, getRatingHistory } from "@/services/dashboard-service";
import { ratingToStars } from "@/lib/rating-display";
import { TopicCard } from "@/features/dashboard/TopicCard";
import { SessionCard } from "@/features/dashboard/SessionCard";
import { RatingChart } from "@/features/dashboard/RatingChart";
import { CategoryBarChart } from "@/features/dashboard/CategoryBarChart";

export default async function DashboardPage() {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    return <div className="p-8">Not signed in.</div>;
  }

  const dbUser = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } });
  if (!dbUser) {
    return <div className="p-8">Your account is still syncing. Try refreshing in a moment.</div>;
  }

  const [activeSession, topicBreakdown, sessions, ratingHistory] = await Promise.all([
    getActiveSession(dbUser.id),
    getTopicBreakdown(dbUser.id),
    getAllSessionsWithStats(dbUser.id),
    getRatingHistory(dbUser.id),
  ]);

  const sessionsForCards = sessions.map((s) => ({ ...s, startedAt: s.startedAt.toISOString() }));

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
    const examLabel = activeSession.examTypes.length > 0 ? `${activeSession.examTypes.join(", ")} · ` : "";
    const qCount = activeSession.questionsCompleted;
    sessionInsight = `${examLabel}${topicLabel} · ${qCount} question${qCount !== 1 ? "s" : ""} so far`;
  }

  const stars = ratingToStars(dbUser.overallRating);
  const streakGoal = dbUser.currentStreak + 1;

  return (
    <div className="min-h-screen bg-[#FFFBF2] text-[#2B2118] dark:bg-neutral-950 dark:text-neutral-100">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="flex items-start justify-between gap-6">
          <h1 className="text-2xl font-semibold" style={{ fontFamily: "var(--font-fredoka), sans-serif" }}>
            Welcome back{dbUser.name ? `, ${dbUser.name}` : ""}
          </h1>

          <div className="shrink-0 rounded-2xl border border-[#F0E6D6] bg-white px-4 py-3 text-right dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center justify-end gap-1.5 text-xs font-semibold text-[#6B5D4F] dark:text-neutral-400">
              🔥 Streak
            </div>
            <div
              className="text-xl font-bold text-[#FF6B4A]"
              style={{ fontFamily: "var(--font-fredoka), sans-serif" }}
            >
              {dbUser.currentStreak} day{dbUser.currentStreak !== 1 ? "s" : ""}
            </div>
            <div className="mt-0.5 text-[11px] text-[#6B5D4F] dark:text-neutral-500">
              {dbUser.currentStreak === 0
                ? "Solve one today to start a streak!"
                : `Keep practicing today to reach ${streakGoal}!`}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <StatCard label="Your rating" value={`★ ${stars}`} accent="#4C3AA0" />
          <StatCard label="Solved" value={dbUser.totalSolved} accent="#2E6B1B" />
          <StatCard label="Attempted" value={dbUser.totalAttempted} accent="#6B5D4F" />
        </div>

        <div className="mt-7">
          {activeSession ? (
            <div>
              <div className="flex gap-3">
                <Link href={`/practice?sessionId=${activeSession.id}`} className={btnPrimary}>
                  Continue Last Session →
                </Link>
                <Link href="/onboarding" className={btnGhost}>
                  Start New Session
                </Link>
              </div>
              {sessionInsight && (
                <p className="mt-2 text-xs text-[#6B5D4F] dark:text-neutral-500">{sessionInsight}</p>
              )}
            </div>
          ) : (
            <Link href="/onboarding" className={btnPrimary}>
              Start Practice Session →
            </Link>
          )}
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
  );
}

function StatCard({ label, value, accent }: { label: string; value: number | string; accent: string }) {
  return (
    <div className="rounded-2xl border border-[#F0E6D6] bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <div
        className="text-2xl font-bold"
        style={{ fontFamily: "var(--font-fredoka), sans-serif", color: accent }}
      >
        {value}
      </div>
      <div className="mt-0.5 text-xs text-[#6B5D4F] dark:text-neutral-500">{label}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-10">
      <h2 className="mb-3 text-lg font-semibold" style={{ fontFamily: "var(--font-fredoka), sans-serif" }}>
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

const btnPrimary =
  "inline-block rounded-xl bg-[#FF6B4A] px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-[#D9502F] hover:shadow-md active:scale-[0.98] dark:bg-[#FF7A5C] dark:hover:bg-[#FF6B4A]";

const btnGhost =
  "inline-block rounded-xl border border-[#F0E6D6] bg-white px-5 py-3 text-sm font-semibold text-[#2B2118] transition-all hover:border-[#FF6B4A]/50 hover:shadow-sm active:scale-[0.98] dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:border-neutral-700";