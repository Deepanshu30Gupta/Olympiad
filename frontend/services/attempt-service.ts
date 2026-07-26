/**
 * Handles everything that happens when a student submits (or surrenders)
 * an attempt at a question:
 *   1. Records the Attempt row.
 *   2. Updates StudentTopicRating for EVERY topic the question belongs
 *      to (a question can span multiple topics — each gets its own
 *      independent Elo update using that topic's own current rating).
 *   3. Updates the question's own currentRating (using the PRIMARY topic
 *      — the first one linked to the question — for the E calculation,
 *      since a single question rating can't reflect multiple topics at
 *      once; this is a deliberate V1 simplification).
 *   4. Updates User-level aggregates: totalAttempted, totalSolved,
 *      overallRating (average of all topic ratings), and the daily streak.
 */

import { prisma } from "@/lib/prisma";
import { expectedScore, performanceScore, kFactor, dynamicStudentKFactor } from "@/lib/rating";
import { computeScoreDelta } from "@/lib/learner-score";
import type { AttemptStatus } from "@prisma/client";

interface SubmitAttemptParams {
  userId: string;
  questionId: string;
  status: AttemptStatus; // SOLVED | WRONG | SURRENDERED
  startedAt: Date;
  hintLevelUsed: number | null;
  solutionViewed: boolean;
  confidenceRating: number | null;
}

const DEFAULT_RATING = 1200;

export async function submitAttempt(params: SubmitAttemptParams) {
  const question = await prisma.question.findUniqueOrThrow({
    where: { id: params.questionId },
    include: { topics: { include: { topic: true } } },
  });

  const solved = params.status === "SOLVED";
  const topicLinks = question.topics; // QuestionTopic[] with .topic populated
  if (topicLinks.length === 0) {
    throw new Error(`Question ${question.externalId} has no topics — cannot update ratings.`);
  }

  // --- Update StudentTopicRating for every topic on this question ---
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
    const baseK = kFactor(attemptsCount);
    const k = dynamicStudentKFactor(baseK, ratingBefore, e, s);
    const ratingAfter = Math.round(ratingBefore + k * (s - e));

    await prisma.studentTopicRating.upsert({
      where: { userId_topicId: { userId: params.userId, topicId } },
      update: { rating: ratingAfter, attemptsCount: attemptsCount + 1 },
      create: { userId: params.userId, topicId, rating: ratingAfter, attemptsCount: 1 },
    });

    // The FIRST topic linked to the question is treated as "primary" for
    // the Attempt record's single before/after snapshot (see file header).
    if (index === 0) {
      primaryStudentRatingBefore = ratingBefore;
      primaryStudentRatingAfter = ratingAfter;
    }
  }

  // --- Update the question's own currentRating (using the primary topic's
  // rating for the E calculation) ---
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

  // --- Record the Attempt itself ---
  const attempt = await prisma.attempt.create({
    data: {
      userId: params.userId,
      questionId: params.questionId,
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

  // --- Update User-level aggregates (now also returns the learner score
  // before/after so the UI can show a delta) ---
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

  // Streak logic: same-day = no change, exactly one day later = +1,
  // any bigger gap = reset to 1.
  const now = new Date();
  const today = startOfDay(now);
  const lastActive = user.lastActiveDate ? startOfDay(user.lastActiveDate) : null;

  // NOTE — known limitation: this compares calendar days using the
  // SERVER's day boundary (Vercel runs in UTC), not the student's own
  // local calendar day. For a student in IST (UTC+5:30), the true local
  // midnight falls mid-afternoon UTC — so a session right around that
  // window could occasionally be bucketed into the "wrong" day from the
  // student's perspective. A fully correct fix needs the student's
  // timezone stored on their profile and used here instead of the
  // server's clock. Flagging honestly rather than claiming this is
  // perfectly correct — it's right the large majority of the time, but
  // not guaranteed right at the boundary.
  let newStreak = user.currentStreak;
  if (!lastActive) {
    newStreak = 1;
  } else {
    const daysDiff = Math.floor((today.getTime() - lastActive.getTime()) / 86_400_000);
    if (daysDiff === 0) newStreak = user.currentStreak; // same day, no change
    else if (daysDiff === 1) newStreak = user.currentStreak + 1;
    else newStreak = 1; // gap — reset
  }
  const newLongestStreak = Math.max(user.longestStreak, newStreak);

  // overallRating: average across all topics the student has ANY rating
  // in. Recomputed here rather than incrementally tracked — simple and
  // correct at this scale; revisit only if this query becomes a proven
  // bottleneck.
  const allRatings = await prisma.studentTopicRating.findMany({
    where: { userId },
    select: { rating: true },
  });
  const overallRating =
    allRatings.length > 0
      ? Math.round(allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length)
      : DEFAULT_RATING;

  // The new learner score — separate from overallRating above, which
  // stays as an internal Elo-style average (still used for the topic
  // charts). This is the intuitive, 0-starting, asymmetric number shown
  // directly to the student.
  const previousScore = user.learnerScore;
  const delta = computeScoreDelta(previousScore, solved);
  const newScore = Math.round((previousScore + delta) * 10) / 10;

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