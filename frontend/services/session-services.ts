import { prisma } from "@/lib/prisma";
import { getNextQuestion } from "@/services/recommendation-service";

export async function getActiveSession(userId: string) {
  return prisma.practiceSession.findFirst({
    where: { userId, status: "ACTIVE" },
    orderBy: { updatedAt: "desc" },
  });
}

/** Ends any existing active session (a user only has one at a time) and
 * starts a fresh one with the given filters. */
export async function createSession(
  userId: string,
  examTypes: string[],
  topicFocus: string[]
) {
  await prisma.practiceSession.updateMany({
    where: { userId, status: "ACTIVE" },
    data: { status: "COMPLETED" },
  });

  return prisma.practiceSession.create({
    data: { userId, examTypes, topicFocus },
  });
}

/** Updates an existing session's filters in place (the "choose another
 * topic" path — keeps the same session, questionsCompleted count, and
 * history, just changes what it's pulling from). */
export async function updateSessionFocus(
  sessionId: string,
  examTypes: string[],
  topicFocus: string[]
) {
  return prisma.practiceSession.update({
    where: { id: sessionId },
    data: { examTypes, topicFocus, currentQuestionId: null },
  });
}

/** The core resume logic: if this session already has a question "in
 * progress" (shown but not yet answered), return that exact same
 * question — this is what makes a page refresh or closed tab resumable
 * rather than silently skipping to a new question. Otherwise, ask the
 * recommendation engine for a new one and remember it on the session. */
export async function getOrPickCurrentQuestion(sessionId: string, userId: string) {
  const session = await prisma.practiceSession.findUniqueOrThrow({
    where: { id: sessionId },
  });

  if (session.currentQuestionId) {
    const question = await prisma.question.findUnique({
      where: { id: session.currentQuestionId },
      include: { hints: { orderBy: { level: "asc" } } },
    });
    if (question) {
      return { question, reason: "Resumed — this question was already in progress." };
    }
    // Fall through if the remembered question somehow no longer exists.
  }

  const result = await getNextQuestion(userId, {
    examTypes: session.examTypes,
    topicFocus: session.topicFocus,
  });

  if (result.question) {
    await prisma.practiceSession.update({
      where: { id: sessionId },
      data: { currentQuestionId: result.question.id },
    });
  }

  return result;
}

/** Called after an attempt is submitted — clears the "in progress"
 * question so the next page load picks a fresh one, and increments the
 * session's completed count. */
export async function advanceSession(sessionId: string) {
  await prisma.practiceSession.update({
    where: { id: sessionId },
    data: { currentQuestionId: null, questionsCompleted: { increment: 1 } },
  });
}

export async function completeSession(sessionId: string) {
  await prisma.practiceSession.update({
    where: { id: sessionId },
    data: { status: "COMPLETED" },
  });
}