import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getOrPickCurrentQuestion } from "@/services/session-service";
import { renderMathText } from "@/lib/render-math";
import { AttemptForm } from "@/features/questions/AttemptForm";

export default async function PracticePage({
  searchParams,
}: {
  searchParams: Promise<{ sessionId?: string; retry?: string }>;
}) {
  const params = await searchParams;
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return <div className="min-h-screen bg-neutral-950 p-8 text-neutral-300">Not signed in.</div>;
  }
  if (!params.sessionId) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-300">
        <div className="mx-auto max-w-2xl p-8">
          <p>No practice session specified.</p>
          <Link href="/onboarding" className="mt-4 inline-block text-[#5B8DEF] hover:underline">
            Start a session →
          </Link>
        </div>
      </div>
    );
  }

  const dbUser = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } });
  if (!dbUser) {
    return (
      <div className="min-h-screen bg-neutral-950 p-8 text-neutral-300">
        Your account is still syncing. Try refreshing in a moment.
      </div>
    );
  }

  const allowRetry = params.retry === "1";
  const result = await getOrPickCurrentQuestion(params.sessionId, dbUser.id, allowRetry);

  if (!result.question) {
    if ("offerRetry" in result && result.offerRetry) {
      return (
        <EmptyStateShell>
          <div className="w-fit rounded-full bg-amber-950/50 px-3 py-1 text-xs font-semibold text-amber-300">
            All fresh questions done
          </div>
          <h1 className="mt-4 text-xl font-semibold text-neutral-100">
            You've been through everything here
          </h1>
          <p className="mt-2 text-sm text-neutral-400">{result.reason}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`/practice?sessionId=${params.sessionId}&retry=1`}
              className="rounded-lg bg-[#5B8DEF] px-4 py-2 text-sm font-medium text-white hover:bg-[#4A7CDE]"
            >
              Retry the ones I got wrong ({result.retryCount})
            </Link>
            <Link
              href={`/onboarding?sessionId=${params.sessionId}`}
              className="rounded-lg border border-neutral-800 px-4 py-2 text-sm text-neutral-300 hover:border-neutral-700"
            >
              Choose another topic
            </Link>
            <Link
              href="/onboarding"
              className="rounded-lg border border-neutral-800 px-4 py-2 text-sm text-neutral-300 hover:border-neutral-700"
            >
              Start a new session
            </Link>
          </div>
        </EmptyStateShell>
      );
    }

    return (
      <EmptyStateShell>
        <div className="w-fit rounded-full bg-emerald-950/50 px-3 py-1 text-xs font-semibold text-emerald-300">
          Session complete
        </div>
        <h1 className="mt-4 text-xl font-semibold text-neutral-100">
          You're out of questions for this session
        </h1>
        <p className="mt-2 text-sm text-neutral-400">{result.reason}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/onboarding"
            className="rounded-lg bg-[#5B8DEF] px-4 py-2 text-sm font-medium text-white hover:bg-[#4A7CDE]"
          >
            Start a new session
          </Link>
          <Link
            href={`/onboarding?sessionId=${params.sessionId}`}
            className="rounded-lg border border-neutral-800 px-4 py-2 text-sm text-neutral-300 hover:border-neutral-700"
          >
            Choose another topic
          </Link>
        </div>
      </EmptyStateShell>
    );
  }

  const q = result.question as typeof result.question & {
    hints: { level: number; content: string }[];
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-2xl px-6 py-10">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-1 text-sm text-neutral-500 transition-colors hover:text-neutral-300"
        >
          ← Dashboard
        </Link>

        <div className="mb-4 flex flex-wrap gap-2 font-mono text-xs text-neutral-500">
          <Pill>{q.externalId}</Pill>
          {q.examType && <Pill>{q.examType}</Pill>}
          <Pill>{q.difficultyLabel ?? "?"}</Pill>
        </div>

        <div
          className="text-base leading-relaxed text-neutral-100"
          dangerouslySetInnerHTML={{ __html: renderMathText(q.statement) }}
        />

        {q.diagramSvg && (
          <div
            className="my-6 flex justify-center rounded-lg border border-neutral-800 bg-white p-4"
            dangerouslySetInnerHTML={{ __html: q.diagramSvg }}
          />
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
      </div>
    </div>
  );
}

function EmptyStateShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-300">
      <div className="mx-auto max-w-2xl px-6 py-10">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-1 text-sm text-neutral-500 transition-colors hover:text-neutral-300"
        >
          ← Dashboard
        </Link>
        {children}
      </div>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-neutral-800 bg-neutral-900 px-2.5 py-1">
      {children}
    </span>
  );
}