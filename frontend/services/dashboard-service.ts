import { prisma } from "@/lib/prisma";

const DEFAULT_RATING = 1200;

/** Maps every topic (parent or child) to its major-category root. A leaf
 * subtopic's category is its parent; a topic with no parent IS a major
 * category itself. */
function resolveMajorCategoryId(topic: { id: string; parentId: string | null }): string {
  return topic.parentId ?? topic.id;
}

export interface TopicBreakdownEntry {
  categoryId: string;
  categoryName: string;
  rating: number;
  solved: number;
  wrong: number;
  surrendered: number;
  totalTimeSeconds: number;
  attempts: {
    externalId: string;
    statement: string;
    status: string;
    activeSolvingSeconds: number | null;
    submittedAt: Date | null;
  }[];
}

/** The core per-topic rollup: for each of the 6 major categories,
 * aggregate rating, solve/wrong/surrender counts, total time, and the
 * individual question-level attempt list (for the dropdown). A question
 * tagged under multiple categories counts toward each — same philosophy
 * as the rating update logic, consistent rather than double-counting
 * being treated as an error. */
export async function getTopicBreakdown(userId: string): Promise<TopicBreakdownEntry[]> {
  const majorCategories = await prisma.topic.findMany({
    where: { parentId: null },
    orderBy: { displayOrder: "asc" },
  });

  const allTopicRatings = await prisma.studentTopicRating.findMany({
    where: { userId },
    include: { topic: true },
  });

  const attempts = await prisma.attempt.findMany({
    where: { userId },
    include: {
      question: {
        include: { topics: { include: { topic: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const breakdown: Record<string, TopicBreakdownEntry> = {};
  for (const cat of majorCategories) {
    breakdown[cat.id] = {
      categoryId: cat.id,
      categoryName: cat.name,
      rating: DEFAULT_RATING,
      solved: 0,
      wrong: 0,
      surrendered: 0,
      totalTimeSeconds: 0,
      attempts: [],
    };
  }

  // Average rating per category, from all StudentTopicRating rows that
  // fall under it (the category itself + all its children).
  const ratingsByCategoryId: Record<string, number[]> = {};
  for (const r of allTopicRatings) {
    const catId = resolveMajorCategoryId(r.topic);
    if (!breakdown[catId]) continue;
    (ratingsByCategoryId[catId] ??= []).push(r.rating);
  }
  for (const catId of Object.keys(ratingsByCategoryId)) {
    const list = ratingsByCategoryId[catId];
    breakdown[catId].rating = Math.round(list.reduce((a, b) => a + b, 0) / list.length);
  }

  // Bucket every attempt into every major category its question touches.
  for (const attempt of attempts) {
    const categoryIds = new Set<string>();
    for (const link of attempt.question.topics) {
      categoryIds.add(resolveMajorCategoryId(link.topic));
    }
    for (const catId of categoryIds) {
      const entry = breakdown[catId];
      if (!entry) continue;

      if (attempt.status === "SOLVED") entry.solved++;
      else if (attempt.status === "WRONG") entry.wrong++;
      else if (attempt.status === "SURRENDERED") entry.surrendered++;

      entry.totalTimeSeconds += attempt.activeSolvingSeconds ?? 0;

      entry.attempts.push({
        externalId: attempt.question.externalId,
        statement: attempt.question.statement.slice(0, 80),
        status: attempt.status,
        activeSolvingSeconds: attempt.activeSolvingSeconds,
        submittedAt: attempt.submittedAt,
      });
    }
  }

  return Object.values(breakdown);
}

export interface SessionSummary {
  id: string;
  name: string;
  status: string;
  startedAt: Date;
  questionsCompleted: number;
  solved: number;
  wrong: number;
  surrendered: number;
  totalTimeSeconds: number;
}

/** Every session the user has ever had, newest first, each with its own
 * solved/wrong/surrendered breakdown computed from Attempts linked to it
 * via sessionId. */
export async function getAllSessionsWithStats(userId: string): Promise<SessionSummary[]> {
  const sessions = await prisma.practiceSession.findMany({
    where: { userId },
    orderBy: { startedAt: "desc" },
    include: { attempts: true },
  });

  return sessions.map((s, index) => {
    const solved = s.attempts.filter((a) => a.status === "SOLVED").length;
    const wrong = s.attempts.filter((a) => a.status === "WRONG").length;
    const surrendered = s.attempts.filter((a) => a.status === "SURRENDERED").length;
    const totalTimeSeconds = s.attempts.reduce((sum, a) => sum + (a.activeSolvingSeconds ?? 0), 0);

    return {
      id: s.id,
      // Fall back to a computed label for sessions that predate the name
      // field — sessions are ordered newest-first here, so we reverse the
      // index to number them in creation order (Session 1 = oldest).
      name: s.name ?? `Session ${sessions.length - index}`,
      status: s.status,
      startedAt: s.startedAt,
      questionsCompleted: s.questionsCompleted,
      solved,
      wrong,
      surrendered,
      totalTimeSeconds,
    };
  });
}

export interface RatingPoint {
  date: string;
  rating: number;
}

/** Rating history for the trend chart — uses the primary
 * studentRatingAfter snapshot from every attempt, in order. This is the
 * same "primary topic" simplification noted in attempt-service.ts, so
 * the chart reflects one consistent rating line rather than trying to
 * plot every topic's rating simultaneously. */
export async function getRatingHistory(userId: string): Promise<RatingPoint[]> {
  const attempts = await prisma.attempt.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    select: { createdAt: true, studentRatingAfter: true },
  });

  return attempts.map((a) => ({
    date: a.createdAt.toISOString().slice(0, 10),
    rating: a.studentRatingAfter,
  }));
}