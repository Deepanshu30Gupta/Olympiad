"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Lightbulb, TrendingUp, Flame, History, BookOpen, ArrowRight } from "lucide-react";

interface FeatureDef {
  id: string;
  icon: typeof Target;
  title: string;
  description: string;
  color: string;
  bg: string;
  Illustration: () => JSX.Element;
}

function AdaptiveIllustration() {
  return (
    <svg viewBox="0 0 200 80" className="h-16 w-full">
      <path d="M10 60 Q 50 20 90 45 T 190 20" stroke="#FF6B4A" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="90" cy="45" r="5" fill="#FF6B4A" />
      <circle cx="190" cy="20" r="4" fill="#FF6B4A" opacity="0.5" />
    </svg>
  );
}
function HintsIllustration() {
  return (
    <svg viewBox="0 0 200 80" className="h-16 w-full">
      <circle cx="40" cy="40" r="22" fill="#4C3AA0" opacity="0.15" />
      <path d="M40 25 a15 15 0 1 0 0.1 0" stroke="#4C3AA0" strokeWidth="3" fill="none" />
      <rect x="34" y="52" width="12" height="6" rx="2" fill="#4C3AA0" />
      <circle cx="90" cy="30" r="6" fill="#4C3AA0" opacity="0.5" />
      <circle cx="115" cy="45" r="4" fill="#4C3AA0" opacity="0.3" />
    </svg>
  );
}
function TrackingIllustration() {
  return (
    <svg viewBox="0 0 200 80" className="h-16 w-full">
      {[20, 45, 30, 60, 40, 65].map((h, i) => (
        <rect key={i} x={10 + i * 28} y={70 - h} width="16" height={h} rx="4" fill="#2E6B1B" opacity={0.4 + i * 0.1} />
      ))}
    </svg>
  );
}
function StreakIllustration() {
  return (
    <svg viewBox="0 0 200 80" className="h-16 w-full">
      <rect x="20" y="15" width="140" height="50" rx="8" fill="#FF6B4A" opacity="0.1" />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={32 + i * 26} y="28" width="16" height="16" rx="3" fill={i < 3 ? "#FF6B4A" : "#FFD9CC"} />
      ))}
      <path d="M150 40 q6 -14 12 0 q4 10 -4 14 q-10 3 -8 -14" fill="#FFB238" />
    </svg>
  );
}
function ResumeIllustration() {
  return (
    <svg viewBox="0 0 200 80" className="h-16 w-full">
      <rect x="30" y="15" width="30" height="45" rx="3" fill="#4C3AA0" opacity="0.85" />
      <path d="M45 15 v20 l-7 -6 l-7 6 v-20 Z" fill="white" opacity="0.9" />
      <circle cx="130" cy="40" r="24" fill="none" stroke="#4C3AA0" strokeWidth="3" opacity="0.4" />
      <path d="M130 26 v14 l10 6" stroke="#4C3AA0" strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>
  );
}
function SolutionsIllustration() {
  return (
    <svg viewBox="0 0 200 80" className="h-16 w-full">
      <rect x="25" y="12" width="150" height="56" rx="6" fill="#2E6B1B" opacity="0.08" />
      <line x1="40" y1="28" x2="120" y2="28" stroke="#2E6B1B" strokeWidth="3" strokeLinecap="round" />
      <line x1="40" y1="40" x2="150" y2="40" stroke="#2E6B1B" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
      <line x1="40" y1="52" x2="100" y2="52" stroke="#2E6B1B" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

const FEATURES: FeatureDef[] = [
  { id: "adaptive", icon: Target, title: "Adaptive Difficulty", color: "#FF6B4A", bg: "#FFF1EC", description: "A rating system, per topic, always matches you to a question in your zone.", Illustration: AdaptiveIllustration },
  { id: "hints", icon: Lightbulb, title: "Progressive Hints", color: "#4C3AA0", bg: "#F1EEFB", description: "Stuck? Reveal hints one level at a time instead of jumping straight to the answer.", Illustration: HintsIllustration },
  { id: "tracking", icon: TrendingUp, title: "Topic Tracking", color: "#2E6B1B", bg: "#EEF7EA", description: "See exactly where you're strong and where you need more reps, by topic.", Illustration: TrackingIllustration },
  { id: "streak", icon: Flame, title: "Daily Streak", color: "#FF6B4A", bg: "#FFF1EC", description: "Build a consistent practice habit, one session at a time.", Illustration: StreakIllustration },
  { id: "resume", icon: History, title: "Resume Anytime", color: "#4C3AA0", bg: "#F1EEFB", description: "Close the tab mid-question, pick up exactly where you left off.", Illustration: ResumeIllustration },
  { id: "solutions", icon: BookOpen, title: "Worked Solutions", color: "#0F9D58", bg: "#EAF7F0", description: "Every question comes with a full explanation, not just an answer key.", Illustration: SolutionsIllustration },
];

const MATH_SYMBOLS = [
  { s: "π", top: "8%", left: "6%" },
  { s: "√", top: "70%", left: "3%" },
  { s: "Σ", top: "15%", left: "92%" },
  { s: "x²", top: "78%", left: "90%" },
  { s: "∞", top: "45%", left: "50%" },
];

export function FeaturesExpandingSection() {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#FFFBF2] to-[#FFF6E8] py-20 dark:from-neutral-950 dark:to-neutral-900">
      {MATH_SYMBOLS.map((m, i) => (
        <span
          key={i}
          className="pointer-events-none absolute select-none text-6xl font-bold text-[#2B2118] opacity-[0.03] dark:text-white dark:opacity-[0.04]"
          style={{ top: m.top, left: m.left }}
        >
          {m.s}
        </span>
      ))}

      <div className="relative mx-auto max-w-6xl px-6 text-center">
        <h2
          className="text-3xl font-extrabold text-[#2B2118] dark:text-neutral-100 md:text-4xl"
          style={{ fontFamily: "var(--font-fredoka), sans-serif" }}
        >
          Master Math Olympiads with Smarter Practice
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm text-[#6B5D4F] dark:text-neutral-400">
          Every question adapts to your progress, helping you practice efficiently, understand
          concepts deeply, and improve consistently.
        </p>

        <div className="mt-14 hidden md:flex md:h-[380px] md:gap-4">
          {FEATURES.map((f, i) => {
            const isExpanded = expanded === i;
            return (
              <motion.div
                key={f.id}
                layout
                onMouseEnter={() => setExpanded(i)}
                onMouseLeave={() => setExpanded(null)}
                transition={{ duration: 0.35, ease: "easeOut" }}
                animate={{ flexGrow: isExpanded ? 3.2 : 1 }}
                className="relative flex min-w-0 flex-1 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[20px] border border-[#F0E6D6] p-6 text-left shadow-sm dark:border-neutral-800"
                style={{ background: isExpanded ? `linear-gradient(160deg, ${f.bg}, white)` : "white" }}
              >
                <div
                  className="pointer-events-none absolute -top-8 h-32 w-32 rounded-full blur-2xl"
                  style={{ backgroundColor: f.color, opacity: isExpanded ? 0.18 : 0.08 }}
                />

                <motion.div
                  animate={{ scale: isExpanded ? 1.15 : 1, rotate: isExpanded ? 4 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: f.bg }}
                >
                  <f.icon size={isExpanded ? 26 : 22} color={f.color} strokeWidth={2.2} />
                </motion.div>

                <AnimatePresence mode="wait">
                  {isExpanded ? (
                    <motion.div
                      key="expanded"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.25, delay: 0.05 }}
                      className="relative z-10 mt-4 w-full"
                    >
                      <h3 className="text-lg font-bold text-[#2B2118] dark:text-neutral-900">{f.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-[#5A4E42]">{f.description}</p>
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="mt-4"
                      >
                        <f.Illustration />
                      </motion.div>
                      <a href="#" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold" style={{ color: f.color }}>
                        Learn More <ArrowRight size={13} />
                      </a>
                    </motion.div>
                  ) : (
                    <motion.h3
                      key="collapsed"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="relative z-10 mt-4 text-center text-sm font-semibold text-[#2B2118] dark:text-neutral-900"
                    >
                      {f.title}
                    </motion.h3>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-10 flex flex-col gap-3 md:hidden">
          {FEATURES.map((f, i) => {
            const isExpanded = expanded === i;
            return (
              <motion.button
                key={f.id}
                layout
                onClick={() => setExpanded(isExpanded ? null : i)}
                className="w-full rounded-[20px] border border-[#F0E6D6] p-5 text-left dark:border-neutral-800 dark:bg-neutral-900"
                style={{ background: isExpanded ? `linear-gradient(160deg, ${f.bg}, white)` : "white" }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl" style={{ backgroundColor: f.bg }}>
                    <f.icon size={22} color={f.color} />
                  </div>
                  <h3 className="text-sm font-bold text-[#2B2118]">{f.title}</h3>
                </div>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="mt-3 text-sm leading-relaxed text-[#5A4E42]">{f.description}</p>
                      <div className="mt-3">
                        <f.Illustration />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}