import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

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

      <div className="mt-10">
        <Link
          href="/onboarding"
          className="inline-block rounded-lg bg-[#5B8DEF] px-6 py-3 text-sm font-medium text-white hover:bg-[#4A7CDE]"
        >
          Start Practice Session →
        </Link>
      </div>

      {/* Per-topic breakdown, attempt history charts, daily goal progress:
          real analytics, deliberately not built yet — this is the
          placeholder home base the practice loop launches from. */}
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