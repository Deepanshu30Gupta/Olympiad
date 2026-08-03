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

export async function getOrPickCurrentQuestion(
  sessionId: string,
  userId: string,
  allowRetry: boolean = false
) {
  const session = await prisma.practiceSession.findUniqueOrThrow({
    where: { id: sessionId },
  });

  if (session.currentQuestionId) {
    const question = await prisma.question.findUnique({
      where: { id: session.currentQuestionId },
      include: { hints: { orderBy: { level: "asc" } } },
    });
    if (question) {
      if (!session.currentQuestionStartedAt) {
        const startedAt = await stampQuestionStart(sessionId);
        return { question, reason: "Resumed — this question was already in progress.", startedAt, accumulatedSeconds: session.currentQuestionAccumulatedSeconds };
      }

      // Real fix: bank the elapsed time from this visit into the
      // persistent accumulator, then start a fresh clock — rather than
      // trusting one timestamp with a recency cutoff (which is what
      // caused time to silently reset to zero if you came back after
      // more than 30 minutes). Capped per-checkpoint at 2 hours as a
      // sanity bound against a genuinely abandoned tab left open for
      // days inflating the total.
      const elapsedThisVisit = Math.min(
        Math.max(0, Math.round((Date.now() - session.currentQuestionStartedAt.getTime()) / 1000)),
        7200
      );
      const newAccumulated = session.currentQuestionAccumulatedSeconds + elapsedThisVisit;
      const startedAt = new Date();
      await prisma.practiceSession.update({
        where: { id: sessionId },
        data: { currentQuestionStartedAt: startedAt, currentQuestionAccumulatedSeconds: newAccumulated },
      });
      return { question, reason: "Resumed — this question was already in progress.", startedAt, accumulatedSeconds: newAccumulated };
    }
  }

  // A queued session (e.g. "Practice All Bookmarks") serves questions
  // from its explicit list, in order, instead of the adaptive engine —
  // this is what makes that feature genuinely self-contained rather
  // than falling back to normal recommendations after the first one.
  if (session.queuedQuestionIds.length > 0) {
    const nextQueuedId = session.queuedQuestionIds[0];
    const question = await prisma.question.findUnique({
      where: { id: nextQueuedId },
      include: { hints: { orderBy: { level: "asc" } } },
    });
    if (question) {
      const startedAt = new Date();
      await prisma.practiceSession.update({
        where: { id: sessionId },
        data: {
          currentQuestionId: question.id,
          currentQuestionStartedAt: startedAt,
          currentQuestionAccumulatedSeconds: 0,
          queuedQuestionIds: session.queuedQuestionIds.slice(1),
        },
      });
      return { question, reason: "Next bookmarked question.", startedAt, accumulatedSeconds: 0 };
    }
    // Queued question no longer exists (e.g. deleted) — drop it and
    // fall through to try the rest of the queue / adaptive engine.
    await prisma.practiceSession.update({
      where: { id: sessionId },
      data: { queuedQuestionIds: session.queuedQuestionIds.slice(1) },
    });
  }

  const result = await getNextQuestion(userId, {
    examTypes: session.examTypes,
    topicFocus: session.topicFocus,
    allowRetry,
  });

  if (result.question) {
    const startedAt = new Date();
    await prisma.practiceSession.update({
      where: { id: sessionId },
      data: { currentQuestionId: result.question.id, currentQuestionStartedAt: startedAt, currentQuestionAccumulatedSeconds: 0 },
    });
    return { ...result, startedAt, accumulatedSeconds: 0 };
  }

  return { ...result, startedAt: null, accumulatedSeconds: 0 };
}

async function stampQuestionStart(sessionId: string): Promise<Date> {
  const now = new Date();
  await prisma.practiceSession.update({ where: { id: sessionId }, data: { currentQuestionStartedAt: now } });
  return now;
}

export async function advanceSession(sessionId: string) {
  await prisma.practiceSession.update({
    where: { id: sessionId },
    data: { currentQuestionId: null, currentQuestionStartedAt: null, currentQuestionAccumulatedSeconds: 0, questionsCompleted: { increment: 1 } },
  });
}

export async function completeSession(sessionId: string) {
  await prisma.practiceSession.update({
    where: { id: sessionId },
    data: { status: "COMPLETED" },
  });
}

/** Resume any past session (not just the currently active one) — a
 * user can only have one ACTIVE session at a time, so this completes
 * whatever else is currently active first, then reactivates the target.
 * getOrPickCurrentQuestion already handles "resume from currentQuestionId
 * if set, else pick next" correctly once a session is ACTIVE again. */
export async function resumeSession(sessionId: string, userId: string) {
  const target = await prisma.practiceSession.findFirst({ where: { id: sessionId, userId } });
  if (!target) throw new Error("Session not found.");

  if (target.status !== "ACTIVE") {
    const currentlyActive = await prisma.practiceSession.findFirst({
      where: { userId, status: "ACTIVE", id: { not: sessionId } },
    });
    if (currentlyActive) {
      await prisma.practiceSession.update({ where: { id: currentlyActive.id }, data: { status: "COMPLETED" } });
    }
    await prisma.practiceSession.update({ where: { id: sessionId }, data: { status: "ACTIVE" } });
  }
}

/** Real, session-scoped attempt history — every question genuinely
 * attempted in this session, in order. Powers both the progress ring
 * (real solved/wrong/surrendered counts, no fake "total") and the
 * question navigator (only questions that actually exist to review). */
export async function getSessionAttempts(sessionId: string) {
  const attempts = await prisma.attempt.findMany({
    where: { sessionId },
    orderBy: { submittedAt: "asc" },
    include: {
      question: {
        select: {
          id: true,
          externalId: true,
          statement: true,
          answerType: true,
          options: true,
          correctAnswer: true,
          solutionMarkdown: true,
          diagramSvg: true,
          difficultyLabel: true,
        },
      },
    },
  });
  return attempts;
}

/** A single past attempt in this session, for the review view. Scoped
 * to the session so a user can't review someone else's attempt by
 * guessing an ID. */
export async function getSessionAttemptById(sessionId: string, attemptId: string) {
  return prisma.attempt.findFirst({
    where: { id: attemptId, sessionId },
    include: {
      question: {
        select: {
          id: true,
          externalId: true,
          statement: true,
          answerType: true,
          options: true,
          correctAnswer: true,
          solutionMarkdown: true,
          diagramSvg: true,
          difficultyLabel: true,
        },
      },
    },
  });
}

/** Real progress counts for the session — no fabricated "total" or
 * "remaining", since sessions are open-ended by design. */
export async function getSessionProgress(sessionId: string) {
  const attempts = await prisma.attempt.findMany({
    where: { sessionId },
    select: { status: true, activeSolvingSeconds: true },
  });
  const solved = attempts.filter((a) => a.status === "SOLVED").length;
  const wrong = attempts.filter((a) => a.status === "WRONG").length;
  const surrendered = attempts.filter((a) => a.status === "SURRENDERED").length;
  const totalAttempted = attempts.length;
  const accuracyPct = totalAttempted > 0 ? Math.round((solved / totalAttempted) * 100) : 0;
  const totalTimeSeconds = attempts.reduce((sum, a) => sum + (a.activeSolvingSeconds ?? 0), 0);

  return { solved, wrong, surrendered, totalAttempted, accuracyPct, totalTimeSeconds };
}