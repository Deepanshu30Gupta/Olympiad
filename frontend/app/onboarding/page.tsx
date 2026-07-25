import { prisma } from "@/lib/prisma";
import { OnboardingWizard } from "@/features/onboarding/OnboardingWizard";
import { EXAM_TYPES } from "@/lib/exam-types";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ sessionId?: string }>;
}) {
  const params = await searchParams;

  const categories = await prisma.topic.findMany({
    where: { parentId: null },
    orderBy: { displayOrder: "asc" },
    include: {
      children: {
        orderBy: { displayOrder: "asc" },
        select: { id: true, slug: true, name: true },
      },
    },
  });

  // Only offer exam types that actually have at least one question right
  // now — showing an exam with zero content would just lead to a dead
  // end on the practice page. This is intentionally a live query, not a
  // hardcoded filter, so it self-corrects the moment new content (e.g.
  // RMO/INMO) gets seeded, without needing this code touched again.
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