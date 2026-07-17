import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getActiveSession } from "@/services/session-service";

export default async function DashboardPage() {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    return <div className="p-8 text-neutral-300">Not signed in.</div>;
  }

  const dbUser = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } });
  if (!dbUser) {
    return (
      <div className="p-8 text-neutral-300">
        Your account is still syncing. Try refreshing in a moment.
      </div>
    );
  }

  const activeSession = await getActiveSession(dbUser.id);

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-neutral-100">
        Welcome back{dbUser.name ? `, ${dbUser.name}` : ""}
      </h1>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Rating" value={dbUser.overallRating} />
        <StatCard label="Streak" value={dbUser.currentStreak} suffix="days" />
        <StatCard label="Solved" value={dbUser.totalSolved} />
        <StatCard label="Attempted" value={dbUser.totalAttempted} />
      </div>

      <div className="mt-10 flex gap-3">
        {activeSession ? (
          <>
            <Link
              href={`/practice?sessionId=${activeSession.id}`}
              className="rounded-lg bg-[#5B8DEF] px-6 py-3 text-sm font-medium text-white hover:bg-[#4A7CDE]"
            >
              Resume Session ({activeSession.questionsCompleted} done) →
            </Link>
            <Link
              href="/onboarding"
              className="rounded-lg border border-neutral-800 px-6 py-3 text-sm font-medium text-neutral-300 hover:border-neutral-700"
            >
              Start New Session
            </Link>
          </>
        ) : (
          <Link
            href="/onboarding"
            className="rounded-lg bg-[#5B8DEF] px-6 py-3 text-sm font-medium text-white hover:bg-[#4A7CDE]"
          >
            Start Practice Session →
          </Link>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, suffix }: { label: string; value: number; suffix?: string }) {
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
      <div className="font-mono text-2xl text-neutral-100">
        {value}
        {suffix && <span className="ml-1 text-sm text-neutral-500">{suffix}</span>}
      </div>
      <div className="mt-1 text-xs text-neutral-500">{label}</div>
    </div>
  );
}