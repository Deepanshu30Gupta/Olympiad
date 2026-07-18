import { prisma } from "@/lib/prisma";
import { getNextQuestion } from "@/services/recommendation-service";

export async function getActiveSession(userId: string) {
  return prisma.practiceSession.findFirst({
    where: { userId, status: "ACTIVE" },
    orderBy: { updatedAt: "desc" },
  });
}

/** Ends any existing active session (a user only has one at a time) and
 * starts a fresh one with the given filters. Auto-names it "Session N"
 * based on how many sessions this user has ever had. */
export async function createSession(
  userId: string,
  examTypes: string[],
  topicFocus: string[]
) {
  await prisma.practiceSession.updateMany({
    where: { userId, status: "ACTIVE" },
    data: { status: "COMPLETED" },
  });

  const existingCount = await prisma.practiceSession.count({ where: { userId } });

  return prisma.practiceSession.create({
    data: {
      userId,
      examTypes,
      topicFocus,
      name: `Session ${existingCount + 1}`,
    },
  });
}

export async function renameSession(sessionId: string, userId: string, name: string) {
  // Scoped by userId too, not just sessionId — prevents renaming a
  // session that isn't yours even if you somehow guessed its id.
  return prisma.practiceSession.updateMany({
    where: { id: sessionId, userId },
    data: { name: name.trim().slice(0, 60) || undefined },
  });
}

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