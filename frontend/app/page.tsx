import Link from "next/link";
import { Show } from "@clerk/nextjs";
import {
  Sparkles,
  ArrowRight,
  User,
  Target,
  Puzzle,
  TrendingUp,
  Lightbulb,
  Flame,
  History,
  BookOpen,
  CheckCircle2,
} from "lucide-react";
import { HeroIllustration } from "@/features/home/HeroIllustration";
import { RatingWidgetIllustration } from "@/features/home/RatingWidgetIllustration";
import { MascotIllustration } from "@/features/home/MascotIllustration";
import { FounderSection } from "@/features/home/FounderSection";
import { FAQSection } from "@/features/home/FAQSection";

const EXAMS = [
  "IOQM",
  "PRMO",
  "RMO",
  "INMO",
  "AMC 10",
  "AMC 12",
  "British Mathematical Olympiad",
  "Balkan Mathematical Olympiad",
];

const STEPS = [
  { icon: User, num: 1, color: "#FF6B4A", title: "Create your account", body: "Takes seconds. Free to start." },
  { icon: Target, num: 2, color: "#4C3AA0", title: "Pick your focus", body: "Choose an exam and topics, or skip and practice a mix of everything." },
  { icon: Puzzle, num: 3, color: "#FF6B4A", title: "Solve, adapt, repeat", body: "Each question is chosen to match your current level — not too easy, not too hard." },
  { icon: TrendingUp, num: 4, color: "#4C3AA0", title: "Watch your rating climb", body: "Every attempt updates your rating, per topic, so you always know where you stand." },
];

const FEATURES = [
  { icon: Target, bg: "#FFE8E0", fg: "#D9502F", title: "Adaptive difficulty", body: "A rating system, per topic, always matches you to a question in your zone." },
  { icon: Lightbulb, bg: "#ECE8FA", fg: "#4C3AA0", title: "Progressive hints", body: "Stuck? Reveal hints one level at a time instead of jumping straight to the answer." },
  { icon: TrendingUp, bg: "#E6F7E0", fg: "#2E6B1B", title: "Topic-level tracking", body: "See exactly where you're strong and where you need more reps, broken down by topic." },
  { icon: Flame, bg: "#FFE8E0", fg: "#D9502F", title: "Daily streaks", body: "Build a consistent practice habit, one session at a time." },
  { icon: History, bg: "#ECE8FA", fg: "#4C3AA0", title: "Resume anytime", body: "Close the tab mid-question, pick up exactly where you left off — including which session you were on." },
  { icon: BookOpen, bg: "#E6F7E0", fg: "#2E6B1B", title: "Real worked solutions", body: "Every question comes with a full explanation, not just an answer key." },
];

const RATING_BULLETS = [
  "Too easy, and you're wasting time. Too hard, and you're just guessing.",
  "Every topic gets its own rating, so strengths and gaps stay visible.",
  "Questions recalibrate too — difficulty reflects how real students actually perform, not just a fixed label.",
  "No two students see the same sequence of problems.",
];

export default function HomePage() {
  return (
    <div className="overflow-hidden bg-[#FFFBF2] dark:bg-neutral-950">
      <section className="relative mx-auto max-w-6xl px-6 pt-16 pb-10">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FFE8E0] px-3 py-1.5 text-xs font-semibold text-[#D9502F] dark:bg-[#FF6B4A]/15 dark:text-[#FF9478]">
              <Sparkles size={12} /> Free to start · No credit card
            </div>
            <h1
              className="mt-4 text-5xl font-extrabold leading-[1.05] text-[#2B2118] dark:text-neutral-100"
              style={{ fontFamily: "var(--font-fredoka), sans-serif" }}
            >
              Prepare like <br />
              a <span className="text-[#FF6B4A]">champion.</span>
            </h1>
            <p className="mt-5 max-w-md text-[#6B5D4F] dark:text-neutral-400">
              Adaptive practice for math olympiad prep. Every question adjusts to your level,
              so you're always working right at the edge of what you can solve.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Show when="signed-in">
                <Link
                  href="/onboarding"
                  className="flex items-center gap-2 rounded-xl bg-[#FF6B4A] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#D9502F] hover:shadow-md"
                >
                  Start practicing free <ArrowRight size={16} />
                </Link>
              </Show>
              <Show when="signed-out">
                <Link
                  href="/sign-up"
                  className="flex items-center gap-2 rounded-xl bg-[#FF6B4A] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#D9502F] hover:shadow-md"
                >
                  Start practicing free <ArrowRight size={16} />
                </Link>
              </Show>
              <a
                href="#how-it-works"
                className="flex items-center gap-2 rounded-xl border border-[#4C3AA0]/30 px-6 py-3 text-sm font-semibold text-[#4C3AA0] transition-all hover:bg-[#ECE8FA] dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-950/30"
              >
                See how it works <ArrowRight size={16} />
              </a>
            </div>
          </div>
          <HeroIllustration />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-[#F0E6D6] dark:bg-neutral-800" />
          <span className="whitespace-nowrap text-sm font-semibold text-[#2B2118] dark:text-neutral-300">
            Built for every major olympiad
          </span>
          <div className="h-px flex-1 bg-[#F0E6D6] dark:bg-neutral-800" />
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {EXAMS.map((exam) => (
            <span
              key={exam}
              className="rounded-full bg-[#ECE8FA] px-4 py-2 text-sm font-bold text-[#4C3AA0] dark:bg-indigo-950/40 dark:text-indigo-300"
            >
              {exam}
            </span>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-16">
        <div className="text-center">
          <h2
            className="text-3xl font-bold text-[#2B2118] dark:text-neutral-100"
            style={{ fontFamily: "var(--font-fredoka), sans-serif" }}
          >
            How it works
          </h2>
          <p className="mt-2 text-sm text-[#6B5D4F] dark:text-neutral-400">
            No setup overhead. You're solving a well-matched problem within a minute of signing up.
          </p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-4">
          {STEPS.map((step) => (
            <div
              key={step.num}
              className="relative rounded-2xl border border-[#F0E6D6] bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900"
            >
              <span
                className="absolute -top-3 -left-3 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: step.color }}
              >
                {step.num}
              </span>
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full"
                style={{ backgroundColor: `${step.color}22` }}
              >
                <step.icon size={22} color={step.color} />
              </div>
              <h3 className="mt-4 font-semibold text-[#2B2118] dark:text-neutral-100">{step.title}</h3>
              <p className="mt-1.5 text-sm text-[#6B5D4F] dark:text-neutral-400">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="text-center">
          <h2
            className="text-3xl font-bold text-[#2B2118] dark:text-neutral-100"
            style={{ fontFamily: "var(--font-fredoka), sans-serif" }}
          >
            Everything you need to train
          </h2>
          <p className="mt-2 text-sm text-[#6B5D4F] dark:text-neutral-400">
            Built around one idea: the best question for you right now is rarely the same as the
            best question for anyone else.
          </p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-[#F0E6D6] bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full"
                style={{ backgroundColor: f.bg }}
              >
                <f.icon size={22} color={f.fg} />
              </div>
              <h3 className="mt-4 font-semibold text-[#2B2118] dark:text-neutral-100">{f.title}</h3>
              <p className="mt-1.5 text-sm text-[#6B5D4F] dark:text-neutral-400">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-8">
        <div className="rounded-3xl bg-[#2E1F6B] px-8 py-12 md:px-14">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-[#FFB238]">
                <Sparkles size={12} /> Why it matters
              </div>
              <h2
                className="mt-4 text-3xl font-bold text-white"
                style={{ fontFamily: "var(--font-fredoka), sans-serif" }}
              >
                Why an <span className="text-[#FF6B4A]">adaptive rating</span>, not a fixed course?
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-[#D8D2F0]">
                A fixed problem set treats every student the same. Qublem's rating system is
                closer to how competitive chess or puzzle platforms work — always finding the
                question that's genuinely useful for you right now.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                {RATING_BULLETS.map((b) => (
                  <div key={b} className="flex items-start gap-2.5">
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[#FF6B4A]" />
                    <span className="text-sm text-[#EDEAFA]">{b}</span>
                  </div>
                ))}
              </div>
              <button className="mt-7 flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-[#4C3AA0] hover:bg-neutral-100">
                Learn how it works <ArrowRight size={16} />
              </button>
            </div>
            <RatingWidgetIllustration />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-8">
        <FounderSection />
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16">
        <h2
          className="text-center text-3xl font-bold text-[#2B2118] dark:text-neutral-100"
          style={{ fontFamily: "var(--font-fredoka), sans-serif" }}
        >
          Questions, answered
        </h2>
        <div className="mt-10">
          <FAQSection />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="flex flex-col items-center gap-6 rounded-3xl bg-[#ECE8FA] px-8 py-10 dark:bg-neutral-900 md:flex-row md:justify-between">
          <div className="flex items-center gap-6">
            <MascotIllustration className="hidden w-20 sm:block" />
            <div>
              <h2
                className="text-2xl font-bold text-[#2B2118] dark:text-neutral-100"
                style={{ fontFamily: "var(--font-fredoka), sans-serif" }}
              >
                Start <span className="text-[#4C3AA0]">training today.</span>
              </h2>
              <p className="mt-1 text-sm text-[#6B5D4F] dark:text-neutral-400">
                Free to use. No credit card. Just you and the next well-matched problem.
              </p>
            </div>
          </div>
          <Show when="signed-in">
            <Link
              href="/onboarding"
              className="flex shrink-0 items-center gap-2 rounded-xl bg-[#FF6B4A] px-6 py-3 text-sm font-semibold text-white hover:bg-[#D9502F]"
            >
              Start practicing free <ArrowRight size={16} />
            </Link>
          </Show>
          <Show when="signed-out">
            <Link
              href="/sign-up"
              className="flex shrink-0 items-center gap-2 rounded-xl bg-[#FF6B4A] px-6 py-3 text-sm font-semibold text-white hover:bg-[#D9502F]"
            >
              Start practicing free <ArrowRight size={16} />
            </Link>
          </Show>
        </div>
      </section>

      <footer className="border-t border-[#F0E6D6] px-6 py-8 dark:border-neutral-800">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-[#6B5D4F] dark:text-neutral-500 sm:flex-row">
          <span
            className="font-bold text-[#2B2118] dark:text-neutral-200"
            style={{ fontFamily: "var(--font-fredoka), sans-serif" }}
          >
            Qublem
          </span>
          <div className="flex gap-6">
            <Link href="#">About</Link>
            <Link href="#">Privacy</Link>
            <Link href="#">Contact</Link>
          </div>
          <span>© 2026 Qublem</span>
        </div>
      </footer>
    </div>
  );
}