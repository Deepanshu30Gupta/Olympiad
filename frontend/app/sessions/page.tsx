import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getAllSessionsWithStats, getTodaysGoalProgress } from "@/services/dashboard-service";
import { DashboardSidebar } from "@/features/dashboard/DashboardSidebar";
import { SessionTimelineItem } from "@/features/dashboard/SessionTimelineItem";

interface SessionForClient {
  id: string;
  name: string;
  status: string;
  startedAt: string;
  questionsCompleted: number;
  solved: number;
  wrong: number;
  surrendered: number;
  totalTimeSeconds: number;
  accuracyPct: number;
  netRatingChange: number | null;
}

function groupByPeriod(sessions: SessionForClient[]) {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - 7);

  const groups: { label: string; sessions: SessionForClient[] }[] = [
    { label: "Today", sessions: [] },
    { label: "Yesterday", sessions: [] },
    { label: "This Week", sessions: [] },
    { label: "Older", sessions: [] },
  ];

  for (const s of sessions) {
    const d = new Date(s.startedAt);
    if (d >= startOfToday) groups[0].sessions.push(s);
    else if (d >= startOfYesterday) groups[1].sessions.push(s);
    else if (d >= startOfWeek) groups[2].sessions.push(s);
    else groups[3].sessions.push(s);
  }

  return groups.filter((g) => g.sessions.length > 0);
}

export default async function SessionsPage() {
  const clerkUser = await currentUser();
  if (!clerkUser) return <div className="p-8">Not signed in.</div>;

  const dbUser = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } });
  if (!dbUser) return <div className="p-8">Your account is still syncing. Try refreshing in a moment.</div>;

  const [sessions, todaysGoal] = await Promise.all([
    getAllSessionsWithStats(dbUser.id),
    getTodaysGoalProgress(dbUser.id, dbUser.dailyGoal),
  ]);
  const sessionsForClient = sessions.map((s) => ({ ...s, startedAt: s.startedAt.toISOString() }));
  const grouped = groupByPeriod(sessionsForClient);

  return (
    <div className="flex min-h-screen bg-[#FFFBF2] dark:bg-neutral-950">
      <DashboardSidebar todaysGoal={todaysGoal} />
      <div className="min-w-0 flex-1 px-6 py-8 md:px-10">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-2xl font-extrabold text-[#2B2118] dark:text-neutral-100" style={{ fontFamily: "var(--font-fredoka), sans-serif" }}>
            📝 Sessions
          </h1>
          <p className="mt-1 text-sm text-[#6B5D4F] dark:text-neutral-400">Every practice session, grouped by when it happened.</p>

          {sessionsForClient.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-[#F0E6D6] bg-white p-8 text-center dark:border-neutral-800 dark:bg-neutral-900">
              <p className="text-sm text-[#6B5D4F] dark:text-neutral-400">No sessions yet — start your first one.</p>
            </div>
          ) : (
            grouped.map((group) => (
              <div key={group.label} className="mt-8">
                <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-[#6B5D4F] dark:text-neutral-500">{group.label}</h2>
                <div className="relative border-l-2 border-[#F0E6D6] pl-6 dark:border-neutral-800">
                  {group.sessions.map((s) => (
                    <SessionTimelineItem key={s.id} {...s} />
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