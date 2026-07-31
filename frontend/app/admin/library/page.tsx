import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { QuestionLibraryClient } from "@/features/admin/QuestionLibraryClient";

export default async function AdminQuestionLibraryPage() {
  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress;
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!email || !adminEmail || email.toLowerCase() !== adminEmail.toLowerCase()) {
    redirect("/");
  }

  const questions = await prisma.question.findMany({
    select: { externalId: true, problemNumber: true, examType: true, contestYear: true, contestSource: true },
    orderBy: [{ examType: "asc" }, { contestYear: "desc" }, { problemNumber: "asc" }],
  });

  const grouped = new Map<string, Map<number, typeof questions>>();
  for (const q of questions) {
    const exam = q.examType ?? "Unlabeled";
    const year = q.contestYear ?? 0;
    if (!grouped.has(exam)) grouped.set(exam, new Map());
    const examGroup = grouped.get(exam)!;
    if (!examGroup.has(year)) examGroup.set(year, []);
    examGroup.get(year)!.push(q);
  }

  const structured = Array.from(grouped.entries()).map(([exam, years]) => ({
    exam,
    years: Array.from(years.entries())
      .sort((a, b) => b[0] - a[0])
      .map(([year, qs]) => ({ year, questions: qs })),
  }));

  return (
    <div className="min-h-screen bg-[#FFFBF2] px-6 py-10 dark:bg-neutral-950">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-extrabold text-[#2B2118] dark:text-neutral-100" style={{ fontFamily: "var(--font-fredoka), sans-serif" }}>
          📚 Question Library
        </h1>
        <p className="mt-1 text-sm text-[#6B5D4F] dark:text-neutral-400">
          {questions.length} questions. Click any problem to open it exactly as a student sees it — real
          submit, hints, and Show Solution, all the same functionality.
        </p>

        <QuestionLibraryClient structured={structured} />
      </div>
    </div>
  );
}