import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { SessionTimer } from "@/features/questions/SessionTimer";
import { getOrPickCurrentQuestion, getSessionAttempts, getSessionAttemptById, getSessionProgress } from "@/services/session-service";
import { renderMathText } from "@/lib/render-math";
import { AttemptForm } from "@/features/questions/AttemptForm";
import { ReportWidget } from "@/components/ReportWidget";
import { BookmarkButton } from "@/features/questions/BookmarkButton";
import { isQuestionBookmarked } from "@/app/actions";
import { SessionProgressRing } from "@/features/questions/SessionProgressRing";
import { QuestionNavigator } from "@/features/questions/QuestionNavigator";
import { AttemptReviewView } from "@/features/questions/AttemptReviewView";

export default async function PracticePage({
  searchParams,
}: {
  searchParams: Promise<{ sessionId?: string; retry?: string; reviewAttemptId?: string }>;
}) {
  const params = await searchParams;
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return <div className="min-h-screen bg-[#FFFBF2] p-8 text-[#2B2118] dark:bg-neutral-950 dark:text-neutral-300">Not signed in.</div>;
  }
  if (!params.sessionId) {
    return (
      <div className="min-h-screen bg-[#FFFBF2] text-[#2B2118] dark:bg-neutral-950 dark:text-neutral-300">
        <div className="mx-auto max-w-2xl p-8">
          <p>No practice session specified.</p>
          <Link href="/onboarding" className="mt-4 inline-block text-[#4C3AA0] hover:underline dark:text-[#5B8DEF]">
            Start a session →
          </Link>
        </div>
      </div>
    );
  }

  const dbUser = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } });
  if (!dbUser) {
    return <div className="min-h-screen bg-[#FFFBF2] p-8 text-[#2B2118] dark:bg-neutral-950 dark:text-neutral-300">Your account is still syncing. Try refreshing in a moment.</div>;
  }

  const [sessionAttempts, sessionProgress] = await Promise.all([
    getSessionAttempts(params.sessionId),
    getSessionProgress(params.sessionId),
  ]);
  const navigatorAttempts = sessionAttempts.map((a) => ({ id: a.id, status: a.status }));

  if (params.reviewAttemptId) {
    const reviewAttempt = await getSessionAttemptById(params.sessionId, params.reviewAttemptId);
    if (!reviewAttempt) {
      return (
        <Shell totalTimeSeconds={sessionProgress.totalTimeSeconds}>
          <MainCol>
            <p className="text-sm text-[#6B5D4F] dark:text-neutral-400">That attempt couldn&rsquo;t be found in this session.</p>
          </MainCol>
          <SideCol>
            <SessionProgressRing {...sessionProgress} />
            <QuestionNavigator sessionId={params.sessionId} attempts={navigatorAttempts} currentReviewId={null} />
          </SideCol>
        </Shell>
      );
    }
    return (
      <Shell totalTimeSeconds={sessionProgress.totalTimeSeconds}>
        <MainCol>
          <AttemptReviewView
            attempt={{
              ...reviewAttempt,
              question: {
                ...reviewAttempt.question,
                options: reviewAttempt.question.options as Record<string, string> | null,
              },
            }}
          />
        </MainCol>
        <SideCol>
          <SessionProgressRing {...sessionProgress} />
          <QuestionNavigator sessionId={params.sessionId} attempts={navigatorAttempts} currentReviewId={params.reviewAttemptId} />
        </SideCol>
      </Shell>
    );
  }

  const allowRetry = params.retry === "1";
  const result = await getOrPickCurrentQuestion(params.sessionId, dbUser.id, allowRetry);

  if (!result.question) {
    if ("offerRetry" in result && result.offerRetry) {
      return (
        <Shell totalTimeSeconds={sessionProgress.totalTimeSeconds}>
          <MainCol>
            <div className="w-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
              All fresh questions done
            </div>
            <h1 className="mt-4 text-xl font-semibold text-[#2B2118] dark:text-neutral-100">You&rsquo;ve been through everything here</h1>
            <p className="mt-2 text-sm text-[#6B5D4F] dark:text-neutral-400">{result.reason}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={`/practice?sessionId=${params.sessionId}&retry=1`} className="rounded-lg bg-[#FF6B4A] px-4 py-2 text-sm font-medium text-white hover:bg-[#D9502F]">
                Retry the ones I got wrong ({result.retryCount})
              </Link>
              <Link href={`/onboarding?sessionId=${params.sessionId}`} className="rounded-lg border border-[#F0E6D6] px-4 py-2 text-sm text-[#2B2118] hover:border-[#FF6B4A]/50 dark:border-neutral-800 dark:text-neutral-300">
                Choose another topic
              </Link>
              <Link href="/onboarding" className="rounded-lg border border-[#F0E6D6] px-4 py-2 text-sm text-[#2B2118] hover:border-[#FF6B4A]/50 dark:border-neutral-800 dark:text-neutral-300">
                Start a new session
              </Link>
            </div>
          </MainCol>
          <SideCol>
            <SessionProgressRing {...sessionProgress} />
            <QuestionNavigator sessionId={params.sessionId} attempts={navigatorAttempts} currentReviewId={null} />
          </SideCol>
        </Shell>
      );
    }

    return (
      <Shell totalTimeSeconds={sessionProgress.totalTimeSeconds}>
        <MainCol>
          <div className="w-fit rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
            Session complete
          </div>
          <h1 className="mt-4 text-xl font-semibold text-[#2B2118] dark:text-neutral-100">You&rsquo;re out of questions for this session</h1>
          <p className="mt-2 text-sm text-[#6B5D4F] dark:text-neutral-400">{result.reason}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/onboarding" className="rounded-lg bg-[#FF6B4A] px-4 py-2 text-sm font-medium text-white hover:bg-[#D9502F]">
              Start a new session
            </Link>
            <Link href={`/onboarding?sessionId=${params.sessionId}`} className="rounded-lg border border-[#F0E6D6] px-4 py-2 text-sm text-[#2B2118] hover:border-[#FF6B4A]/50 dark:border-neutral-800 dark:text-neutral-300">
              Choose another topic
            </Link>
          </div>
        </MainCol>
        <SideCol>
          <SessionProgressRing {...sessionProgress} />
          <QuestionNavigator sessionId={params.sessionId} attempts={navigatorAttempts} currentReviewId={null} />
        </SideCol>
      </Shell>
    );
  }

  const q = result.question as typeof result.question & { hints: { level: number; content: string }[] };
  const bookmarked = await isQuestionBookmarked(dbUser.id, q.id);

  return (
    <Shell totalTimeSeconds={sessionProgress.totalTimeSeconds}>
      <MainCol>
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-wrap gap-2 font-mono text-xs text-[#6B5D4F] dark:text-neutral-500">
            <Pill>{q.externalId}</Pill>
            {q.examType && <Pill>{q.examType}</Pill>}
            <Pill>{q.difficultyLabel ?? "?"}</Pill>
          </div>
          <div className="flex items-center gap-3">
            <BookmarkButton questionId={q.id} initiallyBookmarked={bookmarked} />
            <ReportWidget questionId={q.id} questionExternalId={q.externalId} triggerLabel="Report" />
          </div>
        </div>

        <div className="mt-4 text-base leading-relaxed text-[#2B2118] dark:text-neutral-100" dangerouslySetInnerHTML={{ __html: renderMathText(q.statement) }} />

        {q.diagramSvg && (
          <div className="my-6 flex justify-center rounded-lg border border-[#F0E6D6] bg-white p-4 dark:border-neutral-800" dangerouslySetInnerHTML={{ __html: q.diagramSvg }} />
        )}

        <AttemptForm
          key={q.id}
          sessionId={params.sessionId}
          questionId={q.id}
          answerType={q.answerType}
          options={q.options as Record<string, string> | null}
          hints={q.hints}
          surrenderLockSeconds={dbUser.surrenderLockSeconds}
        />
      </MainCol>
      <SideCol>
        <SessionProgressRing {...sessionProgress} />
        <QuestionNavigator sessionId={params.sessionId} attempts={navigatorAttempts} currentReviewId={null} />
      </SideCol>
    </Shell>
  );
}

function Shell({ children, totalTimeSeconds }: { children: React.ReactNode; totalTimeSeconds?: number }) {
  return (
    <div className="min-h-screen bg-[#FFFBF2] dark:bg-neutral-950">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-[#6B5D4F] transition-colors hover:text-[#2B2118] dark:text-neutral-500 dark:hover:text-neutral-300">
            ← Dashboard
          </Link>
          {totalTimeSeconds !== undefined && <SessionTimer baseSeconds={totalTimeSeconds} />}
        </div>
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">{children}</div>
      </div>
    </div>
  );
}

function MainCol({ children }: { children: React.ReactNode }) {
  return <div className="rounded-3xl border border-[#F0E6D6] bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">{children}</div>;
}

function SideCol({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-4">{children}</div>;
}

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full border border-[#F0E6D6] bg-white px-2.5 py-1 dark:border-neutral-800 dark:bg-neutral-900">{children}</span>;
}