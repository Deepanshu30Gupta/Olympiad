import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getActiveSession } from "@/services/session-service";
import { getTopicBreakdown, getAllSessionsWithStats, getRatingHistory } from "@/services/dashboard-service";
import { TopicCard } from "@/features/dashboard/TopicCard";
import { SessionCard } from "@/features/dashboard/SessionCard";
import { RatingChart } from "@/features/dashboard/RatingChart";
import { CategoryBarChart } from "@/features/dashboard/CategoryBarChart";

export default async function DashboardPage() {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    return <div style={{ padding: 32 }}>Not signed in.</div>;
  }

  const dbUser = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } });
  if (!dbUser) {
    return <div style={{ padding: 32 }}>Your account is still syncing. Try refreshing in a moment.</div>;
  }

  const [activeSession, topicBreakdown, sessions, ratingHistory] = await Promise.all([
    getActiveSession(dbUser.id),
    getTopicBreakdown(dbUser.id),
    getAllSessionsWithStats(dbUser.id),
    getRatingHistory(dbUser.id),
  ]);

  const sessionsForCards = sessions.map((s) => ({ ...s, startedAt: s.startedAt.toISOString() }));

  return (
    <div style={{ background: "#FFFBF2", minHeight: "100vh", fontFamily: "var(--font-jakarta), sans-serif", color: "#2B2118" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px 80px" }}>
        <h1 style={{ fontFamily: "var(--font-fredoka)", fontWeight: 600, fontSize: 30 }}>
          Welcome back{dbUser.name ? `, ${dbUser.name}` : ""}
        </h1>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginTop: 28 }}>
          <StatCard label="Overall rating" value={dbUser.overallRating} accent="#4C3AA0" />
          <StatCard label="Streak" value={dbUser.currentStreak} suffix="days" accent="#FF6B4A" />
          <StatCard label="Solved" value={dbUser.totalSolved} accent="#2E6B1B" />
          <StatCard label="Attempted" value={dbUser.totalAttempted} accent="#6B5D4F" />
        </div>

        <div style={{ marginTop: 28 }}>
          {activeSession ? (
            <div style={{ display: "flex", gap: 12 }}>
              <Link href={`/practice?sessionId=${activeSession.id}`} style={btnPrimary}>
                Resume Session ({activeSession.questionsCompleted} done) →
              </Link>
              <Link href="/onboarding" style={btnGhost}>
                Start New Session
              </Link>
            </div>
          ) : (
            <Link href="/onboarding" style={btnPrimary}>
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
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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
              <p style={{ fontSize: 14, color: "#6B5D4F" }}>No sessions yet — start your first one above.</p>
            </Card>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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

function StatCard({ label, value, suffix, accent }: { label: string; value: number; suffix?: string; accent: string }) {
  return (
    <div style={{ background: "white", border: "1px solid #F0E6D6", borderRadius: 16, padding: 16 }}>
      <div style={{ fontFamily: "var(--font-fredoka)", fontWeight: 700, fontSize: 26, color: accent }}>
        {value}
        {suffix && <span style={{ fontSize: 13, color: "#6B5D4F", marginLeft: 4 }}>{suffix}</span>}
      </div>
      <div style={{ fontSize: 12, color: "#6B5D4F", marginTop: 2 }}>{label}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 40 }}>
      <h2 style={{ fontFamily: "var(--font-fredoka)", fontWeight: 600, fontSize: 20, marginBottom: 14 }}>{title}</h2>
      {children}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: "white", border: "1px solid #F0E6D6", borderRadius: 18, padding: 20 }}>
      {children}
    </div>
  );
}

const btnPrimary: React.CSSProperties = {
  display: "inline-block",
  background: "#FF6B4A",
  color: "white",
  fontWeight: 600,
  fontSize: 14,
  padding: "12px 22px",
  borderRadius: 12,
};

const btnGhost: React.CSSProperties = {
  display: "inline-block",
  background: "white",
  border: "1px solid #F0E6D6",
  color: "#2B2118",
  fontWeight: 600,
  fontSize: 14,
  padding: "12px 22px",
  borderRadius: 12,
};