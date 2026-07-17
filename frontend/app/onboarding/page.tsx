import { prisma } from "@/lib/prisma";
import { OnboardingWizard } from "@/features/onboarding/OnboardingWizard";

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

  return (
    <div className="min-h-screen bg-neutral-950">
      <OnboardingWizard categories={categories} existingSessionId={params.sessionId} />
    </div>
  );
}