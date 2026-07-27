"use server";

import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

interface SubmitReportInput {
  name: string;
  email: string;
  phone: string | null;
  questionId: string | null;
  questionExternalId: string | null;
  comment: string;
}

export async function submitReportAction(input: SubmitReportInput) {
  try {
    if (!input.name.trim() || !input.email.trim() || !input.comment.trim()) {
      return { error: "Name, email, and a description of the issue are required." };
    }

    await prisma.report.create({
      data: {
        name: input.name.trim(),
        email: input.email.trim(),
        phone: input.phone?.trim() || null,
        questionId: input.questionId,
        questionExternalId: input.questionExternalId,
        comment: input.comment.trim(),
      },
    });

    return { error: null };
  } catch (err) {
    console.error("submitReportAction failed:", err);
    return { error: "Couldn't submit your report. Please try again." };
  }
}

async function requireDbUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error("Not signed in.");
  return prisma.user.findUniqueOrThrow({ where: { clerkId: clerkUser.id } });
}

export async function toggleBookmarkAction(questionId: string) {
  try {
    const dbUser = await requireDbUser();

    const existing = await prisma.savedQuestion.findUnique({
      where: { userId_questionId_type: { userId: dbUser.id, questionId, type: "BOOKMARK" } },
    });

    if (existing) {
      await prisma.savedQuestion.delete({ where: { id: existing.id } });
      return { bookmarked: false, error: null };
    } else {
      await prisma.savedQuestion.create({
        data: { userId: dbUser.id, questionId, type: "BOOKMARK" },
      });
      return { bookmarked: true, error: null };
    }
  } catch (err) {
    console.error("toggleBookmarkAction failed:", err);
    return { bookmarked: null, error: "Couldn't update bookmark. Please try again." };
  }
}

export async function isQuestionBookmarked(userId: string, questionId: string): Promise<boolean> {
  const existing = await prisma.savedQuestion.findUnique({
    where: { userId_questionId_type: { userId, questionId, type: "BOOKMARK" } },
  });
  return existing !== null;
}