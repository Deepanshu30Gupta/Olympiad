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
  hintLevelUsed: number | null;
  solutionViewed: boolean;
  confidenceRating: number | null;
}

const DEFAULT_RATING = 1200;
const MAX_LEARNER_SCORE = 5;

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

    const e = expectedScore(ratingBefore, question.currentRating);
    const s = performanceScore(solved, params.hintLevelUsed ?? 0);
    const k = kFactor(attemptsCount);
    const ratingAfter = Math.round(ratingBefore + k * (s - e));

    await prisma.studentTopicRating.upsert({
      where: { userId_topicId: { userId: params.userId, topicId } },
      update: { rating: ratingAfter, attemptsCount: attemptsCount + 1 },
      create: { userId: params.userId, topicId, rating: ratingAfter, attemptsCount: 1 },
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

  const attempt = await prisma.attempt.create({
    data: {
      userId: params.userId,
      questionId: params.questionId,
      sessionId: params.sessionId,
      status: params.status,
      startedAt: params.startedAt,
      submittedAt: new Date(),
      activeSolvingSeconds: Math.round((Date.now() - params.startedAt.getTime()) / 1000),
      hintLevelUsed: params.hintLevelUsed,
      solutionViewed: params.solutionViewed,
      confidenceRating: params.confidenceRating,
      studentRatingBefore: primaryStudentRatingBefore,
      studentRatingAfter: primaryStudentRatingAfter,
      questionRatingBefore,
      questionRatingAfter,
    },
  });

  const { previousScore, newScore } = await updateUserAggregates(params.userId, solved);

  return {
    attempt,
    questionRatingAfter,
    primaryStudentRatingAfter,
    primaryStudentRatingBefore,
    previousScore,
    newScore,
  };
}

async function updateUserAggregates(userId: string, solved: boolean) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

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
  const newScore = Math.min(newScoreRaw, MAX_LEARNER_SCORE);

  await prisma.user.update({
    where: { id: userId },
    data: {
      totalAttempted: user.totalAttempted + 1,
      totalSolved: user.totalSolved + (solved ? 1 : 0),
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