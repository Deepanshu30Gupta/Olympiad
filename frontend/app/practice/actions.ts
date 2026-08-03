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
  previousAttemptId?: string | null;
}

interface SubmitAnswerResult {
  isCorrect: boolean | null;
  correctAnswer: string | null;
  solutionMarkdown: string | null;
  newScore: number | null;
  previousScore: number | null;
  attemptId: string | null;
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
      previousAttemptId: input.previousAttemptId,
    });

    // Only advance the session (mark a question genuinely "completed"
    // and pick a new one) on a fresh submission — a retry is still the
    // same logical question, so the session shouldn't move forward yet.
    if (!input.previousAttemptId) {
      await advanceSession(input.sessionId);
    }

    return {
      isCorrect,
      correctAnswer: question.correctAnswer,
      solutionMarkdown: question.solutionMarkdown,
      newScore: result.newScore,
      previousScore: result.previousScore,
      attemptId: result.attempt.id,
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
      attemptId: null,
      error: "Couldn't submit your answer. Please try again.",
    };
  }
}

interface SurrenderInput {
  sessionId: string;
  questionId: string;
  startedAtMs: number;
  hintLevelUsed: number | null;
  previousAttemptId?: string | null;
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
      previousAttemptId: input.previousAttemptId,
    });

    if (!input.previousAttemptId) {
      await advanceSession(input.sessionId);
    }

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

/** Starts practicing a SPECIFIC bookmarked question directly — no
 * onboarding/setup screen shown to the user. A session is created
 * silently behind the scenes (attempts need one to belong to) and its
 * currentQuestionId is set directly to the bookmarked question, which
 * getOrPickCurrentQuestion already honors as a forced override ahead
 * of the adaptive picker. */
export async function startBookmarkedQuestionAction(questionId: string) {
  try {
    const dbUser = await requireDbUser();
    const existingActive = await prisma.practiceSession.findFirst({
      where: { userId: dbUser.id, status: "ACTIVE" },
    });
    const session = existingActive ?? (await createSession(dbUser.id, [], []));
    await prisma.practiceSession.update({
      where: { id: session.id },
      data: { currentQuestionId: questionId },
    });
    return { sessionId: session.id, error: null };
  } catch (err) {
    console.error("startBookmarkedQuestionAction failed:", err);
    return { sessionId: null, error: "Couldn't open that question. Please try again." };
  }
}

/** Starts practicing bookmarked questions — begins on the oldest-saved
 * bookmark. Honest limitation: the current architecture has no
 * "queued question list" concept, so this doesn't guarantee cycling
 * through every remaining bookmark automatically after each one — a
 * real queue field would need to be added to PracticeSession for that.
 * Each bookmarked question is still individually reachable and
 * practiceable from the Bookmarks page regardless. */
export async function startAllBookmarksAction() {
  try {
    const dbUser = await requireDbUser();
    const bookmarks = await prisma.savedQuestion.findMany({
      where: { userId: dbUser.id, type: "BOOKMARK" },
      orderBy: { createdAt: "asc" },
    });
    if (bookmarks.length === 0) {
      return { sessionId: null, error: "No bookmarked questions yet." };
    }

    // A genuinely new, isolated session — not reusing whatever else was
    // active — containing ONLY the bookmarked questions, in order.
    const session = await createSession(dbUser.id, [], []);
    await prisma.practiceSession.update({
      where: { id: session.id },
      data: {
        name: "Bookmark Practice",
        queuedQuestionIds: bookmarks.map((b) => b.questionId),
      },
    });
    return { sessionId: session.id, error: null };
  } catch (err) {
    console.error("startAllBookmarksAction failed:", err);
    return { sessionId: null, error: "Couldn't start bookmark practice. Please try again." };
  }
}