/**
 * The recommendation engine: picks the next best question for a student.
 *
 * Pool logic (this is the part that was actually broken before):
 *   - "Unseen" = questions in the filtered scope the student has NEVER
 *     attempted, in any status. These are always exhausted FIRST — this
 *     is what guarantees no repeats while fresh content still exists.
 *   - Once unseen is empty, previously WRONG/SURRENDERED questions
 *     become eligible again — but only when the caller explicitly opts
 *     in via `allowRetry` (the UI gates this behind an explicit prompt,
 *     never silently).
 *   - If both pools are empty, the scope is genuinely exhausted.
 *
 * Difficulty selection within the pool:
 *   - Two-tier search: try the weighted-random TOPIC first (for
 *     personalization), but if that specific topic has nothing left in
 *     the pool even after widening, fall back to searching the WHOLE
 *     pool (all topics in scope) before ever declaring "no question" —
 *     a thin topic should never wrongly report exhaustion while other
 *     topics in scope still have unseen content.
 *   - Widening is ASYMMETRIC: when the ideal band (E 0.5–0.65) has
 *     nothing, we widen toward HARDER questions (lower E) freely, but
 *     cap how much easier we're willing to go — a student shouldn't be
 *     served trivially easy content just because the ideal band is thin.
 */

import { prisma } from "@/lib/prisma";
import { expectedScore, ratingWindowForExpectedScore } from "@/lib/rating";

interface RecommendationOptions {
  examTypes?: string[];
  topicFocus?: string[];
  allowRetry?: boolean;
}

const DEFAULT_RATING = 1200;

const WIDENING_STEPS: [number, number][] = [
  [0.5, 0.65],
  [0.3, 0.65],
  [0.1, 0.65],
];

export async function getNextQuestion(userId: string, options: RecommendationOptions = {}) {
  const candidateTopics = await resolveCandidateTopics(options.topicFocus);
  if (candidateTopics.length === 0) {
    return { question: null, exhausted: true, reason: "No topics match the given focus." };
  }
  const candidateTopicIds = candidateTopics.map((t) => t.id);

  const examTypeFilter =
    options.examTypes && options.examTypes.length > 0
      ? { examType: { in: options.examTypes } }
      : {};

  const scopedQuestions = await prisma.question.findMany({
    where: { ...examTypeFilter, topics: { some: { topicId: { in: candidateTopicIds } } } },
    select: { id: true },
  });
  const scopedIds = scopedQuestions.map((q) => q.id);

  if (scopedIds.length === 0) {
    return {
      question: null,
      exhausted: true,
      reason: "No questions match this exam/topic combination yet.",
    };
  }

  const attempts = await prisma.attempt.findMany({
    where: { userId, questionId: { in: scopedIds } },
    select: { questionId: true, status: true },
  });

  const solvedIds = new Set(attempts.filter((a) => a.status === "SOLVED").map((a) => a.questionId));
  const attemptedIds = new Set(attempts.map((a) => a.questionId));
  const retryIds = [...new Set(attempts.map((a) => a.questionId))].filter((id) => !solvedIds.has(id));

  const unseenIds = scopedIds.filter((id) => !attemptedIds.has(id));

  if (unseenIds.length === 0 && !options.allowRetry) {
    if (retryIds.length > 0) {
      return {
        question: null,
        offerRetry: true,
        retryCount: retryIds.length,
        reason: `You've attempted every question in this scope. ${retryIds.length} question${retryIds.length !== 1 ? "s" : ""} weren't solved yet — want to retry them?`,
      };
    }
    return {
      question: null,
      exhausted: true,
      reason: "You're out of questions for this session. Start a new one to keep practicing.",
    };
  }

  const pool = unseenIds.length > 0 ? unseenIds : retryIds;
  if (pool.length === 0) {
    return {
      question: null,
      exhausted: true,
      reason: "You're out of questions for this session. Start a new one to keep practicing.",
    };
  }

  const existingRatings = await prisma.studentTopicRating.findMany({
    where: { userId, topicId: { in: candidateTopicIds } },
  });
  const ratingByTopicId = new Map(existingRatings.map((r) => [r.topicId, r.rating]));
  const topicsWithRating = candidateTopics.map((t) => ({
    ...t,
    rating: ratingByTopicId.get(t.id) ?? DEFAULT_RATING,
  }));
  const avgRating = topicsWithRating.reduce((sum, t) => sum + t.rating, 0) / topicsWithRating.length;
  const weights = topicsWithRating.map((t) => Math.max(0, avgRating - t.rating) + 50);
  const totalWeight = weights.reduce((a, b) => a + b, 0);

  let roll = Math.random() * totalWeight;
  let chosenIndex = 0;
  for (let i = 0; i < weights.length; i++) {
    roll -= weights[i];
    if (roll <= 0) {
      chosenIndex = i;
      break;
    }
  }
  const chosenTopic = topicsWithRating[chosenIndex];
  const usingUnseenPool = pool === unseenIds;

  for (const [minE, maxE] of WIDENING_STEPS) {
    const [minRating, maxRating] = ratingWindowForExpectedScore(chosenTopic.rating, minE, maxE);
    const question = await prisma.question.findFirst({
      where: {
        id: { in: pool },
        currentRating: { gte: minRating, lte: maxRating },
        topics: { some: { topicId: chosenTopic.id } },
      },
      orderBy: { createdAt: "asc" },
      include: { hints: { orderBy: { level: "asc" } } },
    });
    if (question) {
      const eScore = expectedScore(chosenTopic.rating, question.currentRating);
      return buildResult(question, chosenTopic, eScore, usingUnseenPool);
    }
  }

  for (const [minE, maxE] of WIDENING_STEPS) {
    const [minRating, maxRating] = ratingWindowForExpectedScore(chosenTopic.rating, minE, maxE);
    const question = await prisma.question.findFirst({
      where: {
        id: { in: pool },
        currentRating: { gte: minRating, lte: maxRating },
        topics: { some: { topicId: { in: candidateTopicIds } } },
      },
      orderBy: { createdAt: "asc" },
      include: { hints: { orderBy: { level: "asc" } } },
    });
    if (question) {
      const eScore = expectedScore(chosenTopic.rating, question.currentRating);
      return buildResult(question, chosenTopic, eScore, usingUnseenPool);
    }
  }

  const fallback = await prisma.question.findFirst({
    where: { id: { in: pool }, topics: { some: { topicId: { in: candidateTopicIds } } } },
    orderBy: { currentRating: "desc" },
    include: { hints: { orderBy: { level: "asc" } } },
  });
  if (fallback) {
    const eScore = expectedScore(chosenTopic.rating, fallback.currentRating);
    return buildResult(fallback, chosenTopic, eScore, usingUnseenPool);
  }

  return {
    question: null,
    exhausted: true,
    reason: "You're out of questions for this session. Start a new one to keep practicing.",
  };
}

function buildResult(
  question: NonNullable<Awaited<ReturnType<typeof prisma.question.findFirst>>>,
  chosenTopic: { id: string; name: string; rating: number },
  eScore: number,
  fromUnseenPool: boolean
) {
  return {
    question,
    chosenTopic: { id: chosenTopic.id, name: chosenTopic.name, studentRating: chosenTopic.rating },
    expectedScore: eScore,
    reason: fromUnseenPool
      ? `Selected from topic "${chosenTopic.name}", expected score ${eScore.toFixed(2)}.`
      : `Retry — previously attempted question from "${chosenTopic.name}".`,
  };
}

async function resolveCandidateTopics(topicFocus?: string[]) {
  if (!topicFocus || topicFocus.length === 0) {
    return prisma.topic.findMany({ where: { questions: { some: {} } } });
  }

  const focusTopics = await prisma.topic.findMany({
    where: { slug: { in: topicFocus } },
    include: { children: true },
  });

  const resultIds = new Set<string>();
  for (const t of focusTopics) {
    if (t.children.length > 0) {
      resultIds.add(t.id);
      t.children.forEach((c) => resultIds.add(c.id));
    } else {
      resultIds.add(t.id);
    }
  }

  if (resultIds.size === 0) return [];

  return prisma.topic.findMany({
    where: { id: { in: [...resultIds] }, questions: { some: {} } },
  });
}