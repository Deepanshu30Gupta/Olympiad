"use server";

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { submitAttempt } from "@/services/attempt-service";

interface SubmitAnswerInput {
  questionId: string;
  userAnswer: string;
  startedAtMs: number;
  hintLevelUsed: number | null;
  confidenceRating: number | null;
}

export async function submitAnswerAction(input: SubmitAnswerInput) {
  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error("Not signed in.");

  const dbUser = await prisma.user.findUniqueOrThrow({ where: { clerkId: clerkUser.id } });
  const question = await prisma.question.findUniqueOrThrow({ where: { id: input.questionId } });

  // Server-side answer check — never trust correctness determined on
  // the client, since that would be trivially fakeable.
  const isCorrect =
    input.userAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();

  const result = await submitAttempt({
    userId: dbUser.id,
    questionId: input.questionId,
    status: isCorrect ? "SOLVED" : "WRONG",
    startedAt: new Date(input.startedAtMs),
    hintLevelUsed: input.hintLevelUsed,
    solutionViewed: false,
    confidenceRating: input.confidenceRating,
  });

  return {
    isCorrect,
    correctAnswer: question.correctAnswer,
    solutionMarkdown: question.solutionMarkdown,
    newRating: result.primaryStudentRatingAfter,
  };
}

interface SurrenderInput {
  questionId: string;
  startedAtMs: number;
  hintLevelUsed: number | null;
}

export async function surrenderAction(input: SurrenderInput) {
  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error("Not signed in.");

  const dbUser = await prisma.user.findUniqueOrThrow({ where: { clerkId: clerkUser.id } });
  const question = await prisma.question.findUniqueOrThrow({ where: { id: input.questionId } });

  const result = await submitAttempt({
    userId: dbUser.id,
    questionId: input.questionId,
    status: "SURRENDERED",
    startedAt: new Date(input.startedAtMs),
    hintLevelUsed: input.hintLevelUsed,
    solutionViewed: true, // surrendering always reveals the solution
    confidenceRating: null,
  });

  return {
    correctAnswer: question.correctAnswer,
    solutionMarkdown: question.solutionMarkdown,
    newRating: result.primaryStudentRatingAfter,
  };
}