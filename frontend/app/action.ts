"use server";

import { prisma } from "@/lib/prisma";

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