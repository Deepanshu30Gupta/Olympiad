/** Converts the raw internal rating (roughly 800-2000+) into a 1-5 star
 * display value, one decimal place. This is purely a DISPLAY transform —
 * the underlying Elo math and stored rating are completely unaffected;
 * this function only changes what number gets shown to the student. */
export function ratingToStars(rating: number): number {
  const MIN = 800;
  const MAX = 2000;
  const clamped = Math.max(MIN, Math.min(MAX, rating));
  const raw = ((clamped - MIN) / (MAX - MIN)) * 5;
  return Math.round(raw * 10) / 10;
}