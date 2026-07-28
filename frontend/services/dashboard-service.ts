import { prisma } from "@/lib/prisma";
import { ratingToStars } from "@/lib/rating-display";

const DEFAULT_RATING = 1200;

/** Maps every topic (parent or child) to its major-category root. A leaf
 * subtopic's category is its parent; a topic with no parent IS a major
 * category itself. */
function resolveMajorCategoryId(topic: { id: string; parentId: string | null }): string {
  return topic.parentId ?? topic.id;
}

export interface TopicBreakdownEntry {
  categoryId: string;
  categorySlug: string;
  categoryName: string;
  rating: number;
  solved: number;
  wrong: number;
  surrendered: number;
  totalTimeSeconds: number;
  attempts: {
    id: string;
    sessionId: string | null;
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
      categorySlug: cat.slug,
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

  // Multiple attempts on the SAME question (wrong -> hint -> retry) now
  // count as ONE question, not several. Rule: use the most recent
  // response's status, UNLESS the most recent was a surrender (gave
  // up) — in that case fall back to the FIRST response's status, since
  // giving up after already having answered isn't the meaningful
  // signal to report. `attempts` is ordered newest-first already.
  const attemptsByQuestion = new Map<string, typeof attempts>();
  for (const attempt of attempts) {
    const list = attemptsByQuestion.get(attempt.questionId) ?? [];
    list.push(attempt);
    attemptsByQuestion.set(attempt.questionId, list);
  }

  const dedupedAttempts = Array.from(attemptsByQuestion.values()).map((list) => {
    const mostRecent = list[0]; // newest, since attempts is DESC-ordered
    const earliest = list[list.length - 1]; // oldest
    const canonicalStatus = mostRecent.status === "SURRENDERED" ? earliest.status : mostRecent.status;
    const totalTimeForQuestion = list.reduce((sum, a) => sum + (a.activeSolvingSeconds ?? 0), 0);

    return { ...mostRecent, status: canonicalStatus, activeSolvingSeconds: totalTimeForQuestion };
  });

  // Bucket every deduped question into every major category it touches.
  for (const attempt of dedupedAttempts) {
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
        id: attempt.id,
        sessionId: attempt.sessionId,
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
  accuracyPct: number;
  netRatingChange: number | null;
  questions: { attemptId: string; externalId: string; status: string }[];
}

/** Every session the user has ever had, newest first, each with its own
 * solved/wrong/surrendered breakdown, accuracy, duration, and net rating
 * change — all computed here ONCE, so every place that shows a session
 * summary (card, expanded detail) reads from this same source instead
 * of recomputing independently and risking numbers that don't match. */
export async function getAllSessionsWithStats(userId: string): Promise<SessionSummary[]> {
  const sessions = await prisma.practiceSession.findMany({
    where: { userId },
    orderBy: { startedAt: "desc" },
    include: {
      attempts: {
        orderBy: { createdAt: "asc" },
        include: { question: { select: { externalId: true } } },
      },
    },
  });

  return sessions.map((s, index) => {
    // Same dedup rule as topic breakdown: a question attempted more
    // than once in this session (wrong -> hint -> retry) counts once,
    // using the last response's status unless it was a surrender, in
    // which case the first response's status is used instead.
    const byQuestion = new Map<string, typeof s.attempts>();
    for (const a of s.attempts) {
      const list = byQuestion.get(a.questionId) ?? [];
      list.push(a);
      byQuestion.set(a.questionId, list);
    }
    const dedupedAttempts = Array.from(byQuestion.values()).map((list) => {
      // s.attempts is ordered createdAt ASC, so within each question's
      // list: first = earliest, last = most recent.
      const earliest = list[0];
      const mostRecent = list[list.length - 1];
      const canonicalStatus = mostRecent.status === "SURRENDERED" ? earliest.status : mostRecent.status;
      const totalTimeForQuestion = list.reduce((sum, a) => sum + (a.activeSolvingSeconds ?? 0), 0);
      return { ...mostRecent, status: canonicalStatus, activeSolvingSeconds: totalTimeForQuestion };
    });

    const solved = dedupedAttempts.filter((a) => a.status === "SOLVED").length;
    const wrong = dedupedAttempts.filter((a) => a.status === "WRONG").length;
    const surrendered = dedupedAttempts.filter((a) => a.status === "SURRENDERED").length;
    const totalTimeSeconds = dedupedAttempts.reduce((sum, a) => sum + (a.activeSolvingSeconds ?? 0), 0);
    const totalAttempted = dedupedAttempts.length;
    const accuracyPct = totalAttempted > 0 ? Math.round((solved / totalAttempted) * 100) : 0;

    // Net rating change: first attempt's "before" star value vs last
    // attempt's "after" star value. Uses the primary-topic Elo snapshot
    // already stored per attempt — same simplification used elsewhere
    // in the app (a session can span multiple topics; this is a
    // reasonable approximation, not a precise multi-topic breakdown).
    // Uses the RAW (non-deduped) attempts here since this needs the
    // true chronological first/last rating snapshots of the session.
    let netRatingChange: number | null = null;
    if (s.attempts.length > 0) {
      const first = s.attempts[0];
      const last = s.attempts[s.attempts.length - 1];
      const beforeStars = ratingToStars(first.studentRatingBefore);
      const afterStars = ratingToStars(last.studentRatingAfter);
      netRatingChange = Math.round((afterStars - beforeStars) * 10) / 10;
    }

    return {
      id: s.id,
      name: s.name ?? `Session ${sessions.length - index}`,
      status: s.status,
      startedAt: s.startedAt,
      questionsCompleted: s.questionsCompleted,
      solved,
      wrong,
      surrendered,
      totalTimeSeconds,
      accuracyPct,
      netRatingChange,
      questions: s.attempts.map((a) => ({
        attemptId: a.id,
        externalId: a.question.externalId,
        status: a.status,
      })),
    };
  });
}

export interface RatingPoint {
  date: string;
  timestamp: string;
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
    timestamp: a.createdAt.toISOString(),
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
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/** Converts a UTC Date into its IST calendar-day string (YYYY-MM-DD).
 * The server always runs in UTC — without this, "today" on the server
 * can be a full day behind a user's actual IST "today" during evening
 * and night hours, which is exactly the bug this fixes. */
function toISTDateKey(d: Date): string {
  return new Date(d.getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);
}

export async function getActivityHeatmap(userId: string, weeks: number = 6) {
  const daysBack = weeks * 7;
  const nowIST = new Date(Date.now() + IST_OFFSET_MS);
  const start = new Date(nowIST);
  start.setUTCHours(0, 0, 0, 0);
  start.setUTCDate(start.getUTCDate() - daysBack + 1);

  // Align to the most recent Monday on or before `start` — without this,
  // the data grid doesn't line up with the fixed Mon-Sun row labels used
  // by the heatmap component, so a date can render under the wrong
  // weekday label even though the date itself is correct.
  const startDayOfWeek = start.getUTCDay(); // 0 = Sunday, 1 = Monday, ...
  const daysToSubtractForMonday = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
  start.setUTCDate(start.getUTCDate() - daysToSubtractForMonday);

  const totalDays = daysBack + daysToSubtractForMonday;
  const startUTC = new Date(start.getTime() - IST_OFFSET_MS);

  const attempts = await prisma.attempt.findMany({
    where: { userId, submittedAt: { gte: startUTC } },
    select: { submittedAt: true },
  });

  const countByDay = new Map<string, number>();
  for (const a of attempts) {
    if (!a.submittedAt) continue;
    const key = toISTDateKey(a.submittedAt);
    countByDay.set(key, (countByDay.get(key) ?? 0) + 1);
  }

  const days: { date: string; count: number }[] = [];
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
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

/** Real leaderboard rank by learnerScore — for the compact preview card
 * on the dashboard, not a fabricated number. */
export async function getUserRank(userId: string, learnerScore: number): Promise<number> {
  const higherRated = await prisma.user.count({
    where: { learnerScore: { gt: learnerScore } },
  });
  return higherRated + 1;
}

/** All questions the student has genuinely bookmarked, with enough
 * question data to display and link back into practice. */
export async function getBookmarkedQuestions(userId: string) {
  const saved = await prisma.savedQuestion.findMany({
    where: { userId, type: "BOOKMARK" },
    orderBy: { createdAt: "desc" },
    include: {
      question: {
        select: {
          id: true,
          externalId: true,
          statement: true,
          difficultyLabel: true,
          examType: true,
          topics: { include: { topic: true }, take: 1 },
        },
      },
    },
  });
  return saved;
}

/** Real average time spent per attempted question, all-time. */
export async function getAverageTimePerQuestion(userId: string): Promise<number> {
  const result = await prisma.attempt.aggregate({
    where: { userId },
    _avg: { activeSolvingSeconds: true },
  });
  return Math.round(result._avg.activeSolvingSeconds ?? 0);
}

/** Real per-day attempt data for a specific calendar month — powers the
 * full calendar view, fetched on demand as the student navigates
 * between months rather than loading the student's entire history
 * upfront. */
export async function getCalendarMonthData(userId: string, year: number, month: number) {
  // month is 0-indexed (0 = January), matching JS Date conventions
  const startOfMonth = new Date(Date.UTC(year, month, 1));
  const startOfNextMonth = new Date(Date.UTC(year, month + 1, 1));

  const attempts = await prisma.attempt.findMany({
    where: { userId, submittedAt: { gte: startOfMonth, lt: startOfNextMonth } },
    select: { submittedAt: true, status: true },
  });

  const countByDay = new Map<string, { total: number; solved: number }>();
  for (const a of attempts) {
    if (!a.submittedAt) continue;
    const key = a.submittedAt.toISOString().slice(0, 10);
    const existing = countByDay.get(key) ?? { total: 0, solved: 0 };
    existing.total += 1;
    if (a.status === "SOLVED") existing.solved += 1;
    countByDay.set(key, existing);
  }

  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const days: { date: string; total: number; solved: number }[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const key = new Date(Date.UTC(year, month, d)).toISOString().slice(0, 10);
    const data = countByDay.get(key) ?? { total: 0, solved: 0 };
    days.push({ date: key, total: data.total, solved: data.solved });
  }

  return { days, firstWeekday: startOfMonth.getUTCDay() }; // 0 = Sunday
}