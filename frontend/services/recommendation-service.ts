/**
 * The recommendation engine: picks the next best question for a student.
 *
 * Two-step selection, as designed:
 *   1. Pick a TOPIC — weighted toward weaker topics, but never
 *      deterministic (a student weak in one topic shouldn't see ONLY
 *      that topic forever — variety matters for motivation).
 *   2. Pick a QUESTION within that topic — aiming for an expected score
 *      (from the Elo formula) between 0.5–0.65: favored but not
 *      guaranteed, the actual learning sweet spot.
 *
 * Session-level filters (examTypes, topicFocus) are optional, multi-select,
 * and never persisted — passed in fresh each call.
 */

import { prisma } from "@/lib/prisma";
import { expectedScore, ratingWindowForExpectedScore } from "@/lib/rating";

interface RecommendationOptions {
  examTypes?: string[];
  topicFocus?: string[]; // one or more topic/category slugs
}

const DEFAULT_RATING = 1200;
const MIN_EXPECTED_SCORE = 0.5;
const MAX_EXPECTED_SCORE = 0.65;

export async function getNextQuestion(userId: string, options: RecommendationOptions = {}) {
  const candidateTopics = await resolveCandidateTopics(options.topicFocus);
  if (candidateTopics.length === 0) {
    return { question: null, reason: "No topics match the given focus." };
  }

  const existingRatings = await prisma.studentTopicRating.findMany({
    where: { userId, topicId: { in: candidateTopics.map((t) => t.id) } },
  });
  const ratingByTopicId = new Map(existingRatings.map((r) => [r.topicId, r.rating]));

  const topicsWithRating = candidateTopics.map((t) => ({
    ...t,
    rating: ratingByTopicId.get(t.id) ?? DEFAULT_RATING,
  }));

  const avgRating =
    topicsWithRating.reduce((sum, t) => sum + t.rating, 0) / topicsWithRating.length;
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

  const alreadySolvedIds = (
    await prisma.attempt.findMany({
      where: { userId, status: "SOLVED" },
      select: { questionId: true },
    })
  ).map((a) => a.questionId);

  const examTypeFilter =
    options.examTypes && options.examTypes.length > 0
      ? { examType: { in: options.examTypes } }
      : {};

  const attempts = [
    [MIN_EXPECTED_SCORE, MAX_EXPECTED_SCORE],
    [0.35, 0.8],
    [0.15, 0.95],
  ];

  for (const [minE, maxE] of attempts) {
    const [minRating, maxRating] = ratingWindowForExpectedScore(chosenTopic.rating, minE, maxE);

    const question = await prisma.question.findFirst({
      where: {
        id: { notIn: alreadySolvedIds },
        currentRating: { gte: minRating, lte: maxRating },
        ...examTypeFilter,
        topics: { some: { topicId: chosenTopic.id } },
      },
      orderBy: { createdAt: "asc" },
    });

    if (question) {
      const eScore = expectedScore(chosenTopic.rating, question.currentRating);
      return {
        question,
        chosenTopic: { id: chosenTopic.id, name: chosenTopic.name, studentRating: chosenTopic.rating },
        expectedScore: eScore,
        reason: `Selected from topic "${chosenTopic.name}" (student rating ${chosenTopic.rating}), question rating ${question.currentRating}, expected score ${eScore.toFixed(2)}.`,
      };
    }
  }

  return {
    question: null,
    chosenTopic: { id: chosenTopic.id, name: chosenTopic.name, studentRating: chosenTopic.rating },
    reason: `No unsolved question found in "${chosenTopic.name}" even with a widened rating window — topic may be exhausted for this student or too thin in content.`,
  };
}

/** Resolves which topics are eligible, given optional focus slugs. Any
 * slug that's a parent category expands to include its children too.
 * Results are de-duplicated across multiple focus slugs. */
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