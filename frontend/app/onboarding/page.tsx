import { prisma } from "@/lib/prisma";
import { OnboardingWizard } from "@/features/onboarding/OnboardingWizard";
import { EXAM_TYPES } from "@/lib/exam-types";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ sessionId?: string }>;
}) {
  const params = await searchParams;

  // Only show a major category if it (or at least one of its subtopics)
  // actually has questions — and within a shown category, only list
  // subtopics that themselves have questions. Same self-maintaining
  // principle as the exam-type filter below: this is a live query, so
  // it corrects itself the moment new content is seeded, no code change
  // needed here.
  const categories = await prisma.topic.findMany({
    where: {
      parentId: null,
      OR: [{ questions: { some: {} } }, { children: { some: { questions: { some: {} } } } }],
    },
    orderBy: { displayOrder: "asc" },
    include: {
      children: {
        where: { questions: { some: {} } },
        orderBy: { displayOrder: "asc" },
        select: { id: true, slug: true, name: true },
      },
    },
  });

  const distinctExamTypes = await prisma.question.findMany({
    where: { examType: { not: null } },
    distinct: ["examType"],
    select: { examType: true },
  });
  const availableCodes = new Set(distinctExamTypes.map((d) => d.examType));
  const availableExamTypes = EXAM_TYPES.filter((e) => availableCodes.has(e.code));

  return (
    <div className="min-h-screen bg-[#FFFBF2] dark:bg-neutral-950">
      <OnboardingWizard
        categories={categories}
        availableExamTypes={availableExamTypes}
        existingSessionId={params.sessionId}
      />
    </div>
  );
}