"use server";

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { submitAttempt } from "@/services/attempt-service";
import { createSession, updateSessionFocus, advanceSession, renameSession, resumeSession } from "@/services/session-service";

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

// Explicit return type — see prior note: without this, TypeScript infers
// an unnamed union from the two differently-shaped return statements,
// and chaining `??` across it can break control-flow narrowing.
interface SubmitAnswerResult {
  isCorrect: boolean | null;
  correctAnswer: string | null;
  solutionMarkdown: string | null;
  // Renamed from newRating/previousRating: these now carry the
  // learnerScore values (0-starting, asymmetric, capped at +5) — the
  // OLD field names were left over from before that field existed, and
  // kept pointing at internal Elo values even after learnerScore was
  // added, which is exactly what caused the display to silently show
  // the wrong number. New names match what's actually inside them.
  newScore: number | null;
  previousScore: number | null;
  error: string | null;
}

export async function submitAnswerAction(input: SubmitAnswerInput): Promise<SubmitAnswerResult> {
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
      sessionId: input.sessionId,
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
      newScore: result.newScore,
      previousScore: result.previousScore,
      error: null,
    };
  } catch (err) {
    console.error("submitAnswerAction failed:", err);
    return {
      isCorrect: null,
      correctAnswer: null,
      solutionMarkdown: null,
      newScore: null,
      previousScore: null,
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

interface SurrenderResult {
  correctAnswer: string | null;
  solutionMarkdown: string | null;
  newScore: number | null;
  previousScore: number | null;
  error: string | null;
}

export async function surrenderAction(input: SurrenderInput): Promise<SurrenderResult> {
  try {
    const dbUser = await requireDbUser();
    const question = await prisma.question.findUniqueOrThrow({
      where: { id: input.questionId },
    });

    const result = await submitAttempt({
      userId: dbUser.id,
      questionId: input.questionId,
      sessionId: input.sessionId,
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
      newScore: result.newScore,
      previousScore: result.previousScore,
      error: null,
    };
  } catch (err) {
    console.error("surrenderAction failed:", err);
    return {
      correctAnswer: null,
      solutionMarkdown: null,
      newScore: null,
      previousScore: null,
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

export async function resumeSessionAction(sessionId: string) {
  try {
    const dbUser = await requireDbUser();
    await resumeSession(sessionId, dbUser.id);
    return { error: null };
  } catch (err) {
    console.error("resumeSessionAction failed:", err);
    return { error: "Couldn't resume that session. Please try again." };
  }
}