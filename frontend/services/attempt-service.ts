/**
 * Handles everything that happens when a student submits (or surrenders)
 * an attempt at a question:
 *   1. Records the Attempt row.
 *   2. Updates StudentTopicRating for EVERY topic the question belongs
 *      to — plain, standard Elo (kFactor only, no asymmetric tuning).
 *      This is the internal engine that drives question-difficulty
 *      matching, and it should stay boring and well-calibrated, not
 *      psychologically tuned — that's a different concern, handled by
 *      learnerScore below.
 *   3. Updates the question's own currentRating (using the PRIMARY topic
 *      — the first one linked to the question — for the E calculation).
 *   4. Updates User-level aggregates: totalAttempted, totalSolved,
 *      overallRating (average of all topic ratings, still internal/Elo),
 *      the daily streak, and learnerScore — the ONE student-facing
 *      asymmetric progress number (0-starting, capped at +5, uncapped
 *      negative). See lib/learner-score.ts for that logic.
 */

import { prisma } from "@/lib/prisma";
import { expectedScore, performanceScore, kFactor } from "@/lib/rating";
import { computeScoreDelta } from "@/lib/learner-score";
import type { AttemptStatus } from "@prisma/client";

interface SubmitAttemptParams {
  userId: string;
  questionId: string;
  sessionId: string | null;
  status: AttemptStatus;
  startedAt: Date;
  accumulatedSeconds: number;
  hintLevelUsed: number | null;
  solutionViewed: boolean;
  confidenceRating: number | null;
  /** Set when this submission is a retry (after taking a hint) of a
   * question the student already got wrong once in this sitting. When
   * present, the existing Attempt row is updated in place instead of a
   * new one being created, so the same question never counts twice in
   * totalAttempted or shows as two separate attempts. */
  previousAttemptId?: string | null;
}

const DEFAULT_RATING = 1200;
const MAX_LEARNER_SCORE = 5;
const MIN_LEARNER_SCORE = -5;

export async function submitAttempt(params: SubmitAttemptParams) {
  const question = await prisma.question.findUniqueOrThrow({
    where: { id: params.questionId },
    include: { topics: { include: { topic: true } } },
  });

  const solved = params.status === "SOLVED";
  const topicLinks = question.topics;
  if (topicLinks.length === 0) {
    throw new Error(`Question ${question.externalId} has no topics — cannot update ratings.`);
  }

  let primaryStudentRatingBefore = 0;
  let primaryStudentRatingAfter = 0;

  for (const [index, link] of topicLinks.entries()) {
    const topicId = link.topicId;

    const existing = await prisma.studentTopicRating.findUnique({
      where: { userId_topicId: { userId: params.userId, topicId } },
    });

    const ratingBefore = existing?.rating ?? DEFAULT_RATING;
    const attemptsCount = existing?.attemptsCount ?? 0;
    const displayScoreBefore = existing?.displayScore ?? 0;

    const e = expectedScore(ratingBefore, question.currentRating);
    const s = performanceScore(solved, params.hintLevelUsed ?? 0);
    const k = kFactor(attemptsCount);
    const ratingAfter = Math.round(ratingBefore + k * (s - e));

    // Real fix for "topic ratings barely move" — the plain Elo above
    // stays untouched (it drives difficulty matching and must remain
    // stable/well-calibrated). This is a SEPARATE, student-facing
    // number using the same asymmetric formula as the overall
    // learnerScore, so a topic's displayed star rating now moves with
    // comparable speed/feel to the overall rating.
    const displayDelta = computeScoreDelta(displayScoreBefore, solved);
    const displayScoreRaw = Math.round((displayScoreBefore + displayDelta) * 10) / 10;
    const displayScoreAfter = Math.max(MIN_LEARNER_SCORE, Math.min(displayScoreRaw, MAX_LEARNER_SCORE));

    await prisma.studentTopicRating.upsert({
      where: { userId_topicId: { userId: params.userId, topicId } },
      update: { rating: ratingAfter, attemptsCount: attemptsCount + 1, displayScore: displayScoreAfter },
      create: { userId: params.userId, topicId, rating: ratingAfter, attemptsCount: 1, displayScore: displayScoreAfter },
    });

    if (index === 0) {
      primaryStudentRatingBefore = ratingBefore;
      primaryStudentRatingAfter = ratingAfter;
    }
  }

  const questionRatingBefore = question.currentRating;
  const priorAttemptsOnQuestion = await prisma.attempt.count({
    where: { questionId: params.questionId },
  });
  const eForQuestion = expectedScore(primaryStudentRatingBefore, questionRatingBefore);
  const sForQuestion = performanceScore(solved, params.hintLevelUsed ?? 0);
  const kForQuestion = kFactor(priorAttemptsOnQuestion);
  const questionRatingAfter = Math.round(
    questionRatingBefore + kForQuestion * (eForQuestion - sForQuestion)
  );

  await prisma.question.update({
    where: { id: params.questionId },
    data: { currentRating: questionRatingAfter },
  });

  let attempt;
  let previousStatus: AttemptStatus | null = null;

  if (params.previousAttemptId) {
    const existingAttempt = await prisma.attempt.findFirst({
      where: { id: params.previousAttemptId, userId: params.userId, questionId: params.questionId },
    });
    if (existingAttempt) {
      previousStatus = existingAttempt.status;
      // Per the rule: giving up on a retry doesn't overwrite a real
      // wrong-then-gave-up question as "surrendered" — the original
      // wrong response is what determines the outcome here.
      const effectiveStatus = params.status === "SURRENDERED" && previousStatus === "WRONG" ? "WRONG" : params.status;
      attempt = await prisma.attempt.update({
        where: { id: existingAttempt.id },
        data: {
          status: effectiveStatus,
          submittedAt: new Date(),
          // Accumulate time across the retry rather than replacing it —
          // the student spent time on both the first try and the retry.
          activeSolvingSeconds:
            (existingAttempt.activeSolvingSeconds ?? 0) + Math.round((Date.now() - params.startedAt.getTime()) / 1000),
          hintLevelUsed: params.hintLevelUsed,
          solutionViewed: params.solutionViewed,
          confidenceRating: params.confidenceRating ?? existingAttempt.confidenceRating,
          // Keep the ORIGINAL before-snapshot (this is still logically
          // the same attempt), but record the latest after-snapshot.
          studentRatingAfter: primaryStudentRatingAfter,
          questionRatingAfter,
        },
      });
    }
  }

  if (!attempt) {
    attempt = await prisma.attempt.create({
      data: {
        userId: params.userId,
        questionId: params.questionId,
        sessionId: params.sessionId,
        status: params.status,
        startedAt: params.startedAt,
        submittedAt: new Date(),
        activeSolvingSeconds: params.accumulatedSeconds + Math.round((Date.now() - params.startedAt.getTime()) / 1000),
        hintLevelUsed: params.hintLevelUsed,
        solutionViewed: params.solutionViewed,
        confidenceRating: params.confidenceRating,
        studentRatingBefore: primaryStudentRatingBefore,
        studentRatingAfter: primaryStudentRatingAfter,
        questionRatingBefore,
        questionRatingAfter,
      },
    });
  }

  const { previousScore, newScore } = await updateUserAggregates(params.userId, solved, previousStatus);

  return {
    attempt,
    questionRatingAfter,
    primaryStudentRatingAfter,
    primaryStudentRatingBefore,
    previousScore,
    newScore,
  };
}

async function updateUserAggregates(userId: string, solved: boolean, previousStatus: AttemptStatus | null) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const isRetry = previousStatus !== null;
  const wasSolvedBefore = previousStatus === "SOLVED";

  const now = new Date();
  const today = startOfDay(now);
  const lastActive = user.lastActiveDate ? startOfDay(user.lastActiveDate) : null;

  let newStreak = user.currentStreak;
  if (!lastActive) {
    newStreak = 1;
  } else {
    const daysDiff = Math.floor((today.getTime() - lastActive.getTime()) / 86_400_000);
    if (daysDiff === 0) newStreak = user.currentStreak;
    else if (daysDiff === 1) newStreak = user.currentStreak + 1;
    else newStreak = 1;
  }
  const newLongestStreak = Math.max(user.longestStreak, newStreak);

  const allRatings = await prisma.studentTopicRating.findMany({
    where: { userId },
    select: { rating: true },
  });
  const overallRating =
    allRatings.length > 0
      ? Math.round(allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length)
      : DEFAULT_RATING;

  const previousScore = user.learnerScore;
  const delta = computeScoreDelta(previousScore, solved);
  const newScoreRaw = Math.round((previousScore + delta) * 10) / 10;
  const newScore = Math.max(MIN_LEARNER_SCORE, Math.min(newScoreRaw, MAX_LEARNER_SCORE));

  // On a retry, this question was already counted in totalAttempted the
  // first time — don't count it again. Only totalSolved moves, and only
  // if the final outcome actually changed from before.
  const solvedDelta = isRetry ? (solved && !wasSolvedBefore ? 1 : wasSolvedBefore && !solved ? -1 : 0) : solved ? 1 : 0;

  await prisma.user.update({
    where: { id: userId },
    data: {
      totalAttempted: isRetry ? user.totalAttempted : user.totalAttempted + 1,
      totalSolved: user.totalSolved + solvedDelta,
      overallRating,
      learnerScore: newScore,
      currentStreak: newStreak,
      longestStreak: newLongestStreak,
      lastActiveDate: now,
    },
  });

  return { previousScore, newScore };
}

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}