"use server";

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { submitAttempt } from "@/services/attempt-service";
import { createSession, updateSessionFocus, advanceSession, renameSession } from "@/services/session-service";

async function requireDbUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error("Not signed in.");
  return prisma.user.findUniqueOrThrow({ where: { clerkId: clerkUser.id } });
}

export async function createSessionAction(examTypes: string[], topicFocus: string[]) {
  try {
    const dbUser = await requireDbUser();
    const session = await createSession(dbUser.id, examTypes, topicFocus);
    return { sessionId: session.id, error: null };
  } catch (err) {
    console.error("createSessionAction failed:", err);
    return { sessionId: null, error: "Couldn't start a session. Please try again." };
  }
}

export async function updateSessionFocusAction(
  sessionId: string,
  examTypes: string[],
  topicFocus: string[]
) {
  try {
    await updateSessionFocus(sessionId, examTypes, topicFocus);
    return { error: null };
  } catch (err) {
    console.error("updateSessionFocusAction failed:", err);
    return { error: "Couldn't update your session. Please try again." };
  }
}

interface SubmitAnswerInput {
  sessionId: string;
  questionId: string;
  userAnswer: string;
  startedAtMs: number;
  hintLevelUsed: number | null;
  confidenceRating: number | null;
}

export async function submitAnswerAction(input: SubmitAnswerInput) {
  try {
    const dbUser = await requireDbUser();
    const question = await prisma.question.findUniqueOrThrow({
      where: { id: input.questionId },
    });

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

    await advanceSession(input.sessionId);

    return {
      isCorrect,
      correctAnswer: question.correctAnswer,
      solutionMarkdown: question.solutionMarkdown,
      newRating: result.primaryStudentRatingAfter,
      error: null,
    };
  } catch (err) {
    console.error("submitAnswerAction failed:", err);
    return {
      isCorrect: null,
      correctAnswer: null,
      solutionMarkdown: null,
      newRating: null,
      error: "Couldn't submit your answer. Please try again.",
    };
  }
}

interface SurrenderInput {
  sessionId: string;
  questionId: string;
  startedAtMs: number;
  hintLevelUsed: number | null;
}

export async function surrenderAction(input: SurrenderInput) {
  try {
    const dbUser = await requireDbUser();
    const question = await prisma.question.findUniqueOrThrow({
      where: { id: input.questionId },
    });

    const result = await submitAttempt({
      userId: dbUser.id,
      questionId: input.questionId,
      status: "SURRENDERED",
      startedAt: new Date(input.startedAtMs),
      hintLevelUsed: input.hintLevelUsed,
      solutionViewed: true,
      confidenceRating: null,
    });

    await advanceSession(input.sessionId);

    return {
      correctAnswer: question.correctAnswer,
      solutionMarkdown: question.solutionMarkdown,
      newRating: result.primaryStudentRatingAfter,
      error: null,
    };
  } catch (err) {
    console.error("surrenderAction failed:", err);
    return {
      correctAnswer: null,
      solutionMarkdown: null,
      newRating: null,
      error: "Couldn't submit. Please try again.",
    };
  }
}

export async function renameSessionAction(sessionId: string, name: string) {
  try {
    const dbUser = await requireDbUser();
    await renameSession(sessionId, dbUser.id, name);
    return { error: null };
  } catch (err) {
    console.error("renameSessionAction failed:", err);
    return { error: "Couldn't rename the session." };
  }
}