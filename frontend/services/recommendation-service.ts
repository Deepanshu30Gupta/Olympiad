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
 * Session-level filters (examType, topicFocus) are optional and never
 * persisted — passed in fresh each call, per the "ask every session"
 * decision made earlier.
 */

import { prisma } from "@/lib/prisma";
import { expectedScore, ratingWindowForExpectedScore } from "@/lib/rating";

interface RecommendationOptions {
  examType?: string;
  topicFocus?: string; // a specific topic or category slug
}

const DEFAULT_RATING = 1200;
const MIN_EXPECTED_SCORE = 0.5;
const MAX_EXPECTED_SCORE = 0.65;

export async function getNextQuestion(userId: string, options: RecommendationOptions = {}) {
  // Step 1: determine the candidate topic pool.
  const candidateTopics = await resolveCandidateTopics(options.topicFocus);
  if (candidateTopics.length === 0) {
    return { question: null, reason: "No topics match the given focus." };
  }

  // Step 2: get the student's rating in each candidate topic (default
  // 1200 for topics they've never attempted — no StudentTopicRating row
  // exists yet for a brand-new user).
  const existingRatings = await prisma.studentTopicRating.findMany({
    where: { userId, topicId: { in: candidateTopics.map((t) => t.id) } },
  });
  const ratingByTopicId = new Map(existingRatings.map((r) => [r.topicId, r.rating]));

  const topicsWithRating = candidateTopics.map((t) => ({
    ...t,
    rating: ratingByTopicId.get(t.id) ?? DEFAULT_RATING,
  }));

  // Step 3: weighted pick — weaker topics more likely, but every topic
  // has some nonzero chance (the "+50 baseline" keeps this from being
  // pure worst-first drilling, which gets discouraging fast).
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

  // Step 4: find a question in that topic, in the ideal rating window,
  // excluding anything already solved correctly. Progressively widen
  // the window if the topic is too thin to find an exact match — this
  // is a real possibility given some topics/difficulties are still thin
  // per the coverage reports run earlier.
  const alreadySolvedIds = (
    await prisma.attempt.findMany({
      where: { userId, status: "SOLVED" },
      select: { questionId: true },
    })
  ).map((a) => a.questionId);

  const attempts = [
    [MIN_EXPECTED_SCORE, MAX_EXPECTED_SCORE], // ideal window
    [0.35, 0.8], // widened
    [0.15, 0.95], // last resort — almost anything unsolved
  ];

  for (const [minE, maxE] of attempts) {
    const [minRating, maxRating] = ratingWindowForExpectedScore(chosenTopic.rating, minE, maxE);

    const question = await prisma.question.findFirst({
      where: {
        id: { notIn: alreadySolvedIds },
        currentRating: { gte: minRating, lte: maxRating },
        ...(options.examType ? { examType: options.examType } : {}),
        topics: { some: { topicId: chosenTopic.id } },
      },
      orderBy: { createdAt: "asc" }, // deterministic-ish; real randomization can improve later
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

/** Resolves which topics are eligible, given an optional focus. If the
 * focus is a parent category slug, includes all its children too. */
async function resolveCandidateTopics(topicFocus?: string) {
  if (!topicFocus) {
    // No focus given: every topic that actually has at least one question,
    // to avoid ever "selecting" an empty topic.
    return prisma.topic.findMany({
      where: { questions: { some: {} } },
    });
  }

  const focusTopic = await prisma.topic.findUnique({
    where: { slug: topicFocus },
    include: { children: true },
  });
  if (!focusTopic) return [];

  // If it's a parent category, include its children too. Otherwise it's
  // already a leaf subtopic — just itself.
  if (focusTopic.children.length > 0) {
    return prisma.topic.findMany({
      where: {
        OR: [{ id: focusTopic.id }, { parentId: focusTopic.id }],
        questions: { some: {} },
      },
    });
  }
  return [focusTopic];
}