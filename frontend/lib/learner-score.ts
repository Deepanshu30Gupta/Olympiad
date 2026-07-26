/**
 * The "learner score" — a student-facing progress number, deliberately
 * separate from the internal Elo-style rating used by the recommendation
 * engine (that stays untouched, 800-2000-ish, technical and internal).
 *
 * This score:
 *   - Starts at 0 for a new student (not an arbitrary "1200" that means
 *     nothing to anyone outside the rating system).
 *   - Can go negative for a student who's struggling.
 *   - Moves asymmetrically depending on current level and direction:
 *       - LOW score: a correct answer moves it up A LOT (encouraging —
 *         early progress should feel fast). A wrong answer moves it
 *         down only a little (protects against a discouraging spiral).
 *       - HIGH score: a correct answer moves it up only a little
 *         (diminishing returns — staying sharp is expected, not a big
 *         jump). A wrong answer moves it down more (real stakes at the
 *         top — it's harder to stay there than to get there).
 *
 * This is a genuinely new, tunable heuristic — the specific numbers
 * below (0.3 base step, the multiplier curve) are a reasonable first
 * version, not a "correct" answer with a single right formula. Easy to
 * retune later by adjusting the constants here, without touching
 * anything else in the codebase.
 */

const BASE_STEP = 0.3;
const MIN_MULTIPLIER = 0.4;
const MAX_MULTIPLIER = 3;

export function computeScoreDelta(currentScore: number, correct: boolean): number {
  if (correct) {
    const multiplier = clamp(1.6 - currentScore * 0.06, MIN_MULTIPLIER, MAX_MULTIPLIER);
    return round1(BASE_STEP * multiplier);
  } else {
    const multiplier = clamp(1 + currentScore * 0.06, MIN_MULTIPLIER, MAX_MULTIPLIER);
    return round1(-BASE_STEP * multiplier);
  }
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function round1(v: number): number {
  return Math.round(v * 10) / 10;
}