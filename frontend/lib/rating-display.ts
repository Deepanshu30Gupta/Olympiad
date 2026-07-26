/** Converts the raw internal Elo-style rating into the student-facing
 * star number. This is a DISPLAY transform only — the underlying Elo
 * math (which drives actual question-difficulty matching) stays on its
 * native, calibrated scale; only what's SHOWN to the student changes
 * here.
 *
 * Centered at 0: a brand-new student (raw rating 1200, the system
 * default) sees "0", not some arbitrary middle value. Performing above
 * average shows positive, up to a cap of +5. Performing below average
 * shows negative, uncapped — there's no artificial floor, since the
 * point is to honestly reflect struggle, not hide it.
 *
 * Scale: 100 raw Elo points = 1 star. A student would need to reach a
 * raw rating of 1700 to show +5 — realistic given the actual difficulty
 * range in the seeded content (roughly 900-1850 baseRating today).
 */

const CENTER_RATING = 1200; // matches DEFAULT_RATING in lib/rating.ts
const POINTS_PER_STAR = 100;
const MAX_STARS = 5;

export function ratingToStars(rating: number): number {
  const raw = (rating - CENTER_RATING) / POINTS_PER_STAR;
  const capped = Math.min(raw, MAX_STARS); // capped above, NOT below
  return Math.round(capped * 10) / 10;
}