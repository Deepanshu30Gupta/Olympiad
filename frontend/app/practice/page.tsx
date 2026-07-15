import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getNextQuestion } from "@/services/recommendation-service";
import { renderMathText } from "@/lib/render-math";

export default async function PracticePage({
  searchParams,
}: {
  searchParams: Promise<{ examTypes?: string; topicFocus?: string }>;
}) {
  const params = await searchParams;
  const examTypes = params.examTypes ? params.examTypes.split(",").filter(Boolean) : undefined;
  const topicFocus = params.topicFocus ? params.topicFocus.split(",").filter(Boolean) : undefined;

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

  const result = await getNextQuestion(dbUser.id, { examTypes, topicFocus });

  if (!result.question) {
    return (
      <div className="mx-auto max-w-2xl p-8 text-neutral-300">
        <h1 className="text-xl font-semibold">No question available</h1>
        <p className="mt-2 text-sm text-neutral-500">{result.reason}</p>
      </div>
    );
  }

  const q = result.question;

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-4 flex flex-wrap gap-2 font-mono text-xs text-neutral-500">
        <Pill>{q.externalId}</Pill>
        {q.examType && <Pill>{q.examType}</Pill>}
        <Pill>{q.difficultyLabel ?? "?"}</Pill>
        <Pill>rating {q.currentRating}</Pill>
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

      {q.answerType === "MCQ" && q.options && (
        <div className="mt-6 flex flex-col gap-2">
          {Object.entries(q.options as Record<string, string>).map(([key, val]) => (
            <div
              key={key}
              className="rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-neutral-200"
            >
              <span className="mr-2 font-mono text-neutral-500">{key}.</span>
              <span dangerouslySetInnerHTML={{ __html: renderMathText(val) }} />
            </div>
          ))}
        </div>
      )}

      {q.answerType === "NUMERIC" && (
        <div className="mt-6 rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-neutral-400">
          Numeric answer input — not built yet, this page is read-only for now.
        </div>
      )}

      <div className="mt-8 border-t border-neutral-800 pt-4 font-mono text-xs text-neutral-600">
        {result.reason}
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