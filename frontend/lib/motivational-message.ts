export function getMotivationalMessage(streak: number, solvedToday: number, dailyGoal: number): string {
  if (streak === 0) return "Solve your first question today to start a streak.";
  if (solvedToday >= dailyGoal) return `🔥 Today's goal is done — your streak is safe!`;
  const remaining = dailyGoal - solvedToday;
  if (streak >= 7) return `You're getting stronger every day. ${remaining} more to keep the streak alive.`;
  return `Keep your streak alive! ${remaining} more question${remaining !== 1 ? "s" : ""} today.`;
}