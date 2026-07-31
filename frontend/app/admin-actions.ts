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

/** Sends the admin directly into the REAL practice page for a specific
 * question — no separate rendering, this reuses the exact same
 * AttemptForm/practice flow a student gets, including the existing
 * Show Solution button. Reuses one dedicated 'Question Library'
 * session across every click, rather than creating a new session row
 * each time you browse a different question. */
export async function previewQuestionAsAdminAction(externalId: string) {
  try {
    await requireAdmin();
    const clerkUser = await currentUser();
    const dbUser = await prisma.user.findUniqueOrThrow({ where: { clerkId: clerkUser!.id } });

    const question = await prisma.question.findUnique({ where: { externalId } });
    if (!question) return { sessionId: null, error: "That question doesn't exist." };

    let adminSession = await prisma.practiceSession.findFirst({
      where: { userId: dbUser.id, name: "Question Library (Admin)" },
    });
    if (!adminSession) {
      adminSession = await prisma.practiceSession.create({
        data: { userId: dbUser.id, examTypes: [], topicFocus: [], name: "Question Library (Admin)" },
      });
    }

    await prisma.practiceSession.update({
      where: { id: adminSession.id },
      data: {
        status: "ACTIVE",
        currentQuestionId: question.id,
        currentQuestionStartedAt: new Date(),
        queuedQuestionIds: [],
      },
    });

    return { sessionId: adminSession.id, error: null };
  } catch (err) {
    console.error("previewQuestionAsAdminAction failed:", err);
    return { sessionId: null, error: "Couldn't open that question." };
  }
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