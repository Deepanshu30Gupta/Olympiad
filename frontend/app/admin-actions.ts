"use server";

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress;
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!email || !adminEmail || email.toLowerCase() !== adminEmail.toLowerCase()) {
    throw new Error("Not authorized.");
  }
}

export async function getAllReportsAction() {
  await requireAdmin();
  return prisma.report.findMany({ orderBy: { createdAt: "desc" } });
}

/** Fetches a question with everything visible (all hints, the solution,
 * the correct answer) for the admin preview page — deliberately not
 * gated the way the student-facing flow is, since this exists so you
 * can verify a reported question's accuracy at a glance. */
export async function getQuestionForAdminPreview(externalId: string) {
  await requireAdmin();
  return prisma.question.findUnique({
    where: { externalId },
    include: { hints: { orderBy: { level: "asc" } } },
  });
}

export async function markReportRepliedAction(reportId: string, replied: boolean) {
  try {
    await requireAdmin();
    await prisma.report.update({
      where: { id: reportId },
      data: { repliedAt: replied ? new Date() : null },
    });
    return { error: null };
  } catch (err) {
    console.error("markReportRepliedAction failed:", err);
    return { error: "Couldn't update. Please try again." };
  }
}