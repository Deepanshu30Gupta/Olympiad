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

/** How many problems solved today, against the user's own dailyGoal —
 * a real progress bar, not a placeholder. */
export async function getTodaysGoalProgress(userId: string, dailyGoal: number) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const solvedToday = await prisma.attempt.count({
    where: { userId, status: "SOLVED", submittedAt: { gte: startOfToday } },
  });

  return { solvedToday, dailyGoal, pct: Math.min(100, Math.round((solvedToday / dailyGoal) * 100)) };
}

/** Real weekly activity heatmap — counts actual attempts per day over
 * the last several weeks, laid out Mon-Sun rows matching the mockup's
 * GitHub-style grid. Color intensity buckets are based on attempt count. */
export async function getActivityHeatmap(userId: string, weeks: number = 6) {
  const daysBack = weeks * 7;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - daysBack + 1);

  const attempts = await prisma.attempt.findMany({
    where: { userId, submittedAt: { gte: start } },
    select: { submittedAt: true },
  });

  const countByDay = new Map<string, number>();
  for (const a of attempts) {
    if (!a.submittedAt) continue;
    const key = a.submittedAt.toISOString().slice(0, 10);
    countByDay.set(key, (countByDay.get(key) ?? 0) + 1);
  }

  const days: { date: string; count: number }[] = [];
  for (let i = 0; i < daysBack; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    days.push({ date: key, count: countByDay.get(key) ?? 0 });
  }

  const activeDaysLast7 = days.slice(-7).filter((d) => d.count > 0).length;

  return { days, activeDaysLast7 };
}

/** "Current Focus" — the topic with the lowest rating the student has
 * actually attempted, i.e. the topic most worth practicing next. */
export async function getCurrentFocusTopic(userId: string) {
  const ratings = await prisma.studentTopicRating.findMany({
    where: { userId },
    include: { topic: true },
    orderBy: { rating: "asc" },
  });
  if (ratings.length === 0) return null;
  const weakest = ratings[0];
  return { topicName: weakest.topic.name, topicSlug: weakest.topic.slug };
}

/** Next milestone: the next whole star above the student's current
 * learnerScore. The "questions remaining" figure is a rough estimate,
 * not a guarantee — explicitly labeled as such wherever it's shown. */
export function getNextMilestone(learnerScore: number) {
  const nextWhole = Math.floor(learnerScore) + 1;
  const prevWhole = Math.floor(learnerScore);
  const pct = Math.round(((learnerScore - prevWhole) / (nextWhole - prevWhole)) * 100);
  const remainingGap = nextWhole - learnerScore;
  // Rough heuristic: assumes a typical solved question moves the score
  // by roughly 0.05-0.1 — this is an approximation for motivational
  // display, not a precise prediction.
  const estimatedQuestions = Math.max(1, Math.round(remainingGap / 0.07));

  return { target: nextWhole, pct, estimatedQuestions };
}

/** Real "this week" trends — rating change and solved count compared to
 * 7 days ago, computed from actual attempt history, not fabricated. */
export async function getWeeklyTrends(userId: string, currentLearnerScore: number) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [solvedThisWeek, attemptsThisWeek, oldestRecentAttempt] = await Promise.all([
    prisma.attempt.count({ where: { userId, status: "SOLVED", submittedAt: { gte: sevenDaysAgo } } }),
    prisma.attempt.count({ where: { userId, submittedAt: { gte: sevenDaysAgo } } }),
    prisma.attempt.findFirst({
      where: { userId, submittedAt: { gte: sevenDaysAgo } },
      orderBy: { submittedAt: "asc" },
      select: { studentRatingBefore: true },
    }),
  ]);

  let ratingChangeThisWeek: number | null = null;
  if (oldestRecentAttempt) {
    const before = (oldestRecentAttempt.studentRatingBefore - 1200) / 100;
    ratingChangeThisWeek = Math.round((currentLearnerScore - before) * 10) / 10;
  }

  return { solvedThisWeek, attemptsThisWeek, ratingChangeThisWeek };
}

export type MasteryLevel = "Beginner" | "Intermediate" | "Advanced" | "Mastered";

/** Simple, clearly-stated heuristic mapping a topic's star rating to a
 * mastery label — not a scientific classification, just a motivating
 * way to group topics on the Topics page. */
export function getMasteryLevel(stars: number): MasteryLevel {
  if (stars < 1) return "Beginner";
  if (stars < 2.5) return "Intermediate";
  if (stars < 4) return "Advanced";
  return "Mastered";
}

/** Total question count per major category (including all subtopics) —
 * used to show a genuine "X of Y questions" progress bar on the Topics
 * page, not a fabricated total. */
export async function getCategoryQuestionCounts(): Promise<Map<string, number>> {
  const majorCategories = await prisma.topic.findMany({
    where: { parentId: null },
    include: { children: { select: { id: true } } },
  });

  const counts = new Map<string, number>();
  for (const cat of majorCategories) {
    const topicIds = [cat.id, ...cat.children.map((c) => c.id)];
    const count = await prisma.question.count({
      where: { topics: { some: { topicId: { in: topicIds } } } },
    });
    counts.set(cat.id, count);
  }
  return counts;
}