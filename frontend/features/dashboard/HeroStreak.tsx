"use client";

import { motion } from "framer-motion";

export function HeroStreak({ streak }: { streak: number }) {
  const nextMilestone = Math.ceil((streak + 1) / 7) * 7;
  const pct = Math.min(100, Math.round((streak / nextMilestone) * 100));
  const circumference = 2 * Math.PI * 42;
  const offset = circumference * (1 - pct / 100);

  return (
    <div className="relative flex h-28 w-28 shrink-0 items-center justify-center">
      <svg viewBox="0 0 100 100" className="absolute h-full w-full -rotate-90">
        <circle cx="50" cy="50" r="42" fill="none" stroke="#FFE8E0" strokeWidth="8" />
        <motion.circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="#FF6B4A"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className="flex flex-col items-center">
        <motion.span
          className="text-2xl"
          animate={{ scale: [1, 1.08, 1], rotate: [0, -3, 3, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        >
          🔥
        </motion.span>
        <span className="text-xl font-extrabold text-[#2B2118] dark:text-neutral-100" style={{ fontFamily: "var(--font-fredoka), sans-serif" }}>
          {streak}
        </span>
        <span className="text-[10px] text-[#6B5D4F] dark:text-neutral-500">day streak</span>
      </div>
    </div>
  );
}

export function getMotivationalMessage(streak: number, solvedToday: number, dailyGoal: number): string {
  if (streak === 0) return "Solve your first question today to start a streak.";
  if (solvedToday >= dailyGoal) return `🔥 Today's goal is done — your streak is safe!`;
  const remaining = dailyGoal - solvedToday;
  if (streak >= 7) return `You're getting stronger every day. ${remaining} more to keep the streak alive.`;
  return `Keep your streak alive! ${remaining} more question${remaining !== 1 ? "s" : ""} today.`;
}