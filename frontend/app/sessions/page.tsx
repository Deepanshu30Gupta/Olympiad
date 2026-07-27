import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getAllSessionsWithStats } from "@/services/dashboard-service";
import { DashboardSidebar } from "@/features/dashboard/DashboardSidebar";
import { SessionTimelineItem } from "@/features/dashboard/SessionTimelineItem";

export default async function SessionsPage() {
  const clerkUser = await currentUser();
  if (!clerkUser) return <div className="p-8">Not signed in.</div>;

  const dbUser = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } });
  if (!dbUser) return <div className="p-8">Your account is still syncing. Try refreshing in a moment.</div>;

  const sessions = await getAllSessionsWithStats(dbUser.id);
  const sessionsForClient = sessions.map((s) => ({ ...s, startedAt: s.startedAt.toISOString() }));

  return (
    <div className="flex min-h-screen bg-[#FFFBF2] dark:bg-neutral-950">
      <DashboardSidebar />
      <div className="min-w-0 flex-1 px-6 py-8 md:px-10">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-2xl font-extrabold text-[#2B2118] dark:text-neutral-100" style={{ fontFamily: "var(--font-fredoka), sans-serif" }}>
            📝 Sessions
          </h1>
          <p className="mt-1 text-sm text-[#6B5D4F] dark:text-neutral-400">Every practice session, in order.</p>

          {sessionsForClient.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-[#F0E6D6] bg-white p-8 text-center dark:border-neutral-800 dark:bg-neutral-900">
              <p className="text-sm text-[#6B5D4F] dark:text-neutral-400">No sessions yet — start your first one.</p>
            </div>
          ) : (
            <div className="relative mt-8 border-l-2 border-[#F0E6D6] pl-6 dark:border-neutral-800">
              {sessionsForClient.map((s) => (
                <SessionTimelineItem key={s.id} {...s} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}