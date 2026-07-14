/**
 * Core rating math: the Elo-style expected-score formula and the
 * multi-signal performance scoring model (hints, correctness) designed
 * for this platform. Shared by the recommendation engine (to find
 * well-matched questions) and the attempt-submission service (to update
 * ratings after an attempt) — one source of truth for the formulas.
 */

/** Standard Elo expected-score formula: probability the student solves
 * this question correctly, given current ratings. Returns a value in
 * (0, 1). */
export function expectedScore(studentRating: number, questionRating: number): number {
  return 1 / (1 + Math.pow(10, (questionRating - studentRating) / 400));
}

/** Hint penalty scale, agreed on earlier: solving with heavy help is
 * real evidence, but weaker evidence of mastery than solving cold. Only
 * applied when the question was actually solved correctly. */
const HINT_PENALTY: Record<number, number> = {
  0: 1.0,
  1: 0.9,
  2: 0.75,
  3: 0.6,
  4: 0.4,
};

/** Performance score S in [0, 1] fed into the Elo update in place of a
 * plain 0/1 — accounts for hint usage. Time does NOT factor into S
 * itself (that would push S above 1, breaking the probability model);
 * time instead scales the K-factor, applied separately in the rating
 * service when we build attempt submission. */
export function performanceScore(solved: boolean, highestHintLevelUsed: number): number {
  if (!solved) return 0;
  const penalty = HINT_PENALTY[highestHintLevelUsed] ?? HINT_PENALTY[4];
  return penalty;
}

/** K-factor tiers: new students/questions (few attempts) should move
 * fast, established ones should stabilize. */
export function kFactor(attemptsCount: number): number {
  return attemptsCount < 10 ? 40 : 20;
}

/** Given a student's rating, the question-rating window that yields an
 * expected score within [minE, maxE] — i.e. "favored but not guaranteed",
 * the sweet spot for learning (same principle as Chess.com puzzle
 * recommendations). Returns [minQuestionRating, maxQuestionRating]. */
export function ratingWindowForExpectedScore(
  studentRating: number,
  minE: number,
  maxE: number
): [number, number] {
  // Invert the expected-score formula: E = 1/(1+10^((q-s)/400))
  //   => q = s - 400 * log10(E / (1 - E))
  const qForMaxE = studentRating - 400 * Math.log10(maxE / (1 - maxE));
  const qForMinE = studentRating - 400 * Math.log10(minE / (1 - minE));
  return [Math.min(qForMaxE, qForMinE), Math.max(qForMaxE, qForMinE)];
}