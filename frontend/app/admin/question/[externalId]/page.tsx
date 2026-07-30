import { redirect, notFound } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getQuestionForAdminPreview } from "@/app/admin-actions";
import { renderMathText } from "@/lib/render-math";

export default async function AdminQuestionPreviewPage({
  params,
}: {
  params: Promise<{ externalId: string }>;
}) {
  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress;
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!email || !adminEmail || email.toLowerCase() !== adminEmail.toLowerCase()) {
    redirect("/");
  }

  const { externalId } = await params;
  const question = await getQuestionForAdminPreview(externalId);
  if (!question) notFound();

  const options = question.options as Record<string, string> | null;

  return (
    <div className="min-h-screen bg-[#FFFBF2] px-6 py-10 dark:bg-neutral-950">
      <div className="mx-auto max-w-3xl">
        <Link href="/admin/messages" className="mb-6 flex items-center gap-1.5 text-sm text-[#6B5D4F] hover:text-[#2B2118] dark:text-neutral-400 dark:hover:text-neutral-200">
          <ArrowLeft size={16} /> Back to Inbox
        </Link>

        <div className="flex flex-wrap gap-2 font-mono text-xs text-[#6B5D4F] dark:text-neutral-500">
          <span className="rounded-full border border-[#F0E6D6] px-2.5 py-1 dark:border-neutral-800">{question.externalId}</span>
          {question.examType && <span className="rounded-full border border-[#F0E6D6] px-2.5 py-1 dark:border-neutral-800">{question.examType}</span>}
          {question.difficultyLabel && <span className="rounded-full border border-[#F0E6D6] px-2.5 py-1 dark:border-neutral-800">{question.difficultyLabel}</span>}
          <span className="rounded-full bg-[#ECE8FA] px-2.5 py-1 text-[#4C3AA0] dark:bg-indigo-950/40 dark:text-indigo-300">Admin preview — everything visible</span>
        </div>

        <div className="mt-6 rounded-3xl border border-[#F0E6D6] bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="text-xs font-bold uppercase tracking-wide text-[#6B5D4F] dark:text-neutral-500">Statement (as the student sees it)</h2>
          <div className="mt-3 text-base leading-relaxed text-[#2B2118] dark:text-neutral-100" dangerouslySetInnerHTML={{ __html: renderMathText(question.statement) }} />

          {question.diagramSvg && (
            <div className="my-6 flex justify-center rounded-lg border border-[#F0E6D6] bg-white p-4 dark:border-neutral-800" dangerouslySetInnerHTML={{ __html: question.diagramSvg }} />
          )}

          {question.answerType === "MCQ" && options && (
            <div className="mt-4 flex flex-col gap-2">
              {Object.entries(options).map(([key, val]) => {
                const isCorrect = key === question.correctAnswer;
                return (
                  <div
                    key={key}
                    className={`rounded-lg border px-4 py-3 text-sm ${
                      isCorrect
                        ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                        : "border-[#F0E6D6] bg-white text-[#6B5D4F] dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400"
                    }`}
                  >
                    <span className="mr-2 font-mono opacity-70">{key}.</span>
                    <span dangerouslySetInnerHTML={{ __html: renderMathText(val) }} />
                    {isCorrect && <span className="ml-2 text-xs font-semibold">← correct</span>}
                  </div>
                );
              })}
            </div>
          )}

          {question.answerType !== "MCQ" && (
            <div className="mt-4 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Correct answer: {question.correctAnswer}
            </div>
          )}
        </div>

        {question.hints.length > 0 && (
          <div className="mt-4 rounded-3xl border border-amber-300 bg-amber-50 p-6 dark:border-amber-900 dark:bg-amber-950/30">
            <h2 className="text-xs font-bold uppercase tracking-wide text-amber-800 dark:text-amber-300">All hints (normally revealed one at a time)</h2>
            <div className="mt-3 flex flex-col gap-3">
              {question.hints.map((h) => (
                <div key={h.level}>
                  <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">Hint {h.level}</span>
                  <div className="mt-1 text-sm text-[#2B2118] dark:text-neutral-200" dangerouslySetInnerHTML={{ __html: renderMathText(h.content) }} />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 rounded-3xl border border-[#F0E6D6] bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="text-xs font-bold uppercase tracking-wide text-[#6B5D4F] dark:text-neutral-500">Solution</h2>
          <div className="mt-3 text-sm leading-relaxed text-[#2B2118]/90 dark:text-neutral-300" dangerouslySetInnerHTML={{ __html: renderMathText(question.solutionMarkdown) }} />
        </div>
      </div>
    </div>
  );
}