import Link from "next/link";
import { Show } from "@clerk/nextjs";
import {
  Sparkles,
  ArrowRight,
  User,
  Target,
  Puzzle,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";
import { HeroParallax } from "@/features/home/HeroParallax";
import { ExamMarquee } from "@/features/home/ExamMarquee";
import { FeaturesExpandingSection } from "@/features/home/FeaturesExpandingSection";
import { RatingWidgetIllustration } from "@/features/home/RatingWidgetIllustration";
import { MascotIllustration } from "@/features/home/MascotIllustration";
import { ChessKnight } from "@/features/home/ChessKnight";
import { FounderSection } from "@/features/home/FounderSection";
import { FAQSection } from "@/features/home/FAQSection";
import { Sparkle, Squiggle, DotGrid, DottedPath, PaperAirplane, MotionLines } from "@/features/home/decorations";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { RippleWrapper } from "@/components/ui/RippleWrapper";

const STEPS = [
  { icon: User, num: 1, color: "#FF6B4A", bg: "#FFE8E0", title: "Create your account", body: "Takes seconds. Free to start." },
  { icon: Target, num: 2, color: "#4C3AA0", bg: "#ECE8FA", title: "Pick your focus", body: "Choose an exam and topics, or skip and practice a mix of everything." },
  { icon: Puzzle, num: 3, color: "#FF6B4A", bg: "#FFE8E0", title: "Solve, adapt, repeat", body: "Each question is chosen to match your current level — not too easy, not too hard." },
  { icon: TrendingUp, num: 4, color: "#4C3AA0", bg: "#ECE8FA", title: "Watch your rating climb", body: "Every attempt updates your rating, per topic, so you always know where you stand." },
];

const RATING_BULLETS = [
  "Too easy, and you're wasting time. Too hard, and you're just guessing.",
  "Every topic gets its own rating, so strengths and gaps stay visible.",
  "Questions recalibrate too — difficulty reflects how real students actually perform, not just a fixed label.",
  "No two students see the same sequence of problems.",
];

const cardHover =
  "transition-all duration-[250ms] ease-out hover:-translate-y-1.5 hover:scale-[1.02] hover:shadow-xl";

export default function HomePage() {
  return (
    <div className="overflow-hidden bg-[#FFFBF2] dark:bg-neutral-950">
      <section className="relative flex min-h-[640px] items-center overflow-hidden">
        <DotGrid color="#D8CBB5" className="pointer-events-none absolute left-10 top-24 hidden md:block" />

        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 px-6 py-14 md:grid-cols-2">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FFE8E0] px-3 py-1.5 text-xs font-semibold text-[#D9502F] dark:bg-[#FF6B4A]/15 dark:text-[#FF9478]">
              <Sparkles size={12} /> Free to start · No credit required
            </div>
            <h1
              className="mt-4 text-5xl font-extrabold leading-[1.05] text-[#2B2118] dark:text-neutral-100"
              style={{ fontFamily: "var(--font-fredoka), sans-serif" }}
            >
              Prepare like <br />
              a <span className="relative text-[#FF6B4A]">
                champion.
                <Squiggle color="#FF6B4A" width={110} className="absolute -bottom-[3px] left-0" />
              </span>
            </h1>
            <p className="mt-6 max-w-sm text-[#6B5D4F] dark:text-neutral-400">
              Adaptive practice for math olympiad prep. Every question adjusts to your level,
              so you're always working right at the edge of what you can solve.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Show when="signed-in">
                <RippleWrapper className="rounded-xl">
                  <Link
                    href="/onboarding"
                    className="flex items-center gap-2 rounded-xl bg-[#FF6B4A] px-6 py-3 text-sm font-semibold text-white"
                  >
                    Start Practicing <ArrowRight size={16} />
                  </Link>
                </RippleWrapper>
              </Show>
              <Show when="signed-out">
                <RippleWrapper className="rounded-xl">
                  <Link
                    href="/sign-up"
                    className="flex items-center gap-2 rounded-xl bg-[#FF6B4A] px-6 py-3 text-sm font-semibold text-white"
                  >
                    Start Practicing <ArrowRight size={16} />
                  </Link>
                </RippleWrapper>
              </Show>
              <a
                href="#how-it-works"
                className="flex items-center gap-2 rounded-xl border border-[#D8CBB5]/60 px-6 py-3 text-sm font-medium text-[#8A7C6C] transition-colors hover:text-[#6B5D4F] dark:border-neutral-800 dark:text-neutral-500 dark:hover:text-neutral-300"
              >
                See how it works <ArrowRight size={15} />
              </a>
            </div>
          </div>
          <div className="animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
            <HeroParallax />
          </div>
        </div>
      </section>

      <div className="relative mx-auto max-w-6xl px-6 pb-10">
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-[#F0E6D6] dark:bg-neutral-800" />
          <span className="whitespace-nowrap text-sm font-semibold text-[#2B2118] dark:text-neutral-300">
            Built for every major olympiad
          </span>
          <div className="h-px flex-1 bg-[#F0E6D6] dark:bg-neutral-800" />
        </div>
        <div className="mt-6">
          <ExamMarquee />
        </div>
      </div>

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-10 -z-10 mx-auto h-[600px] max-w-5xl rounded-[80px] bg-[#FFF3E0] opacity-60 dark:bg-neutral-900/40" />
        <DotGrid color="#FF6B4A" className="pointer-events-none absolute left-8 top-1/2 hidden md:block" />
        <DotGrid color="#4C3AA0" className="pointer-events-none absolute bottom-16 right-16 hidden md:block" />

        <div id="how-it-works" className="relative mx-auto max-w-6xl px-6 py-16">
          <ScrollReveal className="text-center">
            <h2 className="inline-block text-3xl font-bold text-[#2B2118] dark:text-neutral-100" style={{ fontFamily: "var(--font-fredoka), sans-serif" }}>
              <span className="relative">
                How it works
                <Squiggle color="#4C3AA0" width={70} className="absolute -bottom-2 left-1/2 -translate-x-1/2" />
              </span>
            </h2>
            <p className="mt-3 text-sm text-[#6B5D4F] dark:text-neutral-400">
              No setup overhead. You're solving a well-matched problem within a minute of signing up.
            </p>
          </ScrollReveal>

          <div className="mt-12 flex flex-col gap-5 md:flex-row md:items-stretch">
            {STEPS.map((step, i) => (
              <ScrollReveal key={step.num} delay={i * 80} className="flex flex-1">
                <div className="flex w-full">
                  <div className={`relative flex h-full w-full flex-col rounded-2xl border border-[#F0E6D6] bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900 ${cardHover}`}>
                    <span
                      className="absolute -top-3 -left-3 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: step.color }}
                    >
                      {step.num}
                    </span>
                    <div className="relative flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: step.bg }}>
                      <step.icon size={22} color={step.color} />
                      <MotionLines color={step.color} className="absolute -top-2 -right-2" />
                    </div>
                    <h3 className="mt-4 font-semibold text-[#2B2118] dark:text-neutral-100">{step.title}</h3>
                    <p className="mt-1.5 text-sm text-[#6B5D4F] dark:text-neutral-400">{step.body}</p>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="hidden shrink-0 items-center px-2 text-[#FF6B4A] md:flex">
                      <svg width="28" height="16" viewBox="0 0 28 16">
                        <line x1="0" y1="8" x2="18" y2="8" stroke="#FF6B4A" strokeWidth="2" strokeDasharray="3 4" strokeLinecap="round" />
                        <path d="M16 3 L23 8 L16 13" stroke="#FF6B4A" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>

      </section>

      <FeaturesExpandingSection />

      <ScrollReveal>
        <section className="relative mx-auto max-w-6xl px-6 py-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#2E1F6B] to-[#251A55] px-8 py-12 md:px-14">
            <Sparkle size={18} color="#EDEAFA" className="pointer-events-none absolute right-16 top-10 animate-twinkle-a" />
            <Sparkle size={12} color="#FFB238" className="pointer-events-none absolute right-8 top-32 animate-twinkle-b" />
            <Sparkle size={14} color="#EDEAFA" className="pointer-events-none absolute right-40 bottom-16 animate-twinkle-c" />
            <Sparkle size={10} color="#6FCF52" className="pointer-events-none absolute left-1/2 top-6 animate-twinkle-a" />

            <div className="relative grid items-center gap-10 md:grid-cols-2">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-[#FFB238]">
                  <Sparkles size={12} /> Why it matters
                </div>
                <h2 className="relative mt-4 text-3xl font-bold text-white" style={{ fontFamily: "var(--font-fredoka), sans-serif" }}>
                  Why an <span className="text-[#FF6B4A]">adaptive rating</span>, not a fixed course?
                  <Squiggle color="#FF6B4A" width={80} className="absolute -bottom-2 left-0" />
                </h2>
                <p className="mt-5 text-sm leading-relaxed text-[#D8D2F0]">
                  A fixed problem set treats every student the same. Qublem's rating system is
                  closer to how competitive chess or puzzle platforms work — always finding the
                  question that's genuinely useful for you right now.
                </p>
                <div className="mt-6 flex flex-col">
                  {RATING_BULLETS.map((b, i) => (
                    <div key={b}>
                      <div className="flex items-start gap-2.5 py-2.5">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FF6B4A]">
                          <CheckCircle2 size={13} className="text-white" />
                        </span>
                        <span className="text-sm text-[#EDEAFA]">{b}</span>
                      </div>
                      {i < RATING_BULLETS.length - 1 && <div className="border-b border-dashed border-white/15" />}
                    </div>
                  ))}
                </div>
                <RippleWrapper className="mt-7 rounded-xl">
                  <Show when="signed-in">
                    <Link href="/onboarding" className="flex w-fit items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-[#4C3AA0]">
                      Start Practicing <ArrowRight size={16} />
                    </Link>
                  </Show>
                  <Show when="signed-out">
                    <Link href="/sign-up" className="flex w-fit items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-[#4C3AA0]">
                      Start Practicing <ArrowRight size={16} />
                    </Link>
                  </Show>
                </RippleWrapper>
              </div>

              <div className="relative">
                <ChessKnight className="absolute -right-4 top-1/2 hidden h-64 w-64 -translate-y-1/2 opacity-90 md:block" />
                <div className="relative">
                  <RatingWidgetIllustration />
                </div>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section id="founder" className="mx-auto max-w-6xl px-6 py-8">
          <FounderSection />
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section id="faq" className="relative mx-auto max-w-3xl px-6 py-16">
          <DotGrid color="#FF6B4A" className="pointer-events-none absolute left-0 top-4 hidden sm:block" />
          <DottedPath color="#4C3AA0" className="pointer-events-none absolute -right-4 top-0 hidden sm:block" />
          <Sparkle size={14} color="#FF6B4A" className="pointer-events-none absolute right-6 top-40 hidden sm:block" />

          <h2 className="relative text-center text-3xl font-bold text-[#2B2118] dark:text-neutral-100" style={{ fontFamily: "var(--font-fredoka), sans-serif" }}>
            <span className="relative inline-block">
              Questions, answered
              <Squiggle color="#4C3AA0" width={90} className="absolute -bottom-2 left-1/2 -translate-x-1/2" />
            </span>
          </h2>
          <div className="mt-12">
            <FAQSection />
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="relative mx-auto max-w-6xl px-6 pb-16">
          <PaperAirplane color="#4C3AA0" className="pointer-events-none absolute right-10 -top-2 hidden sm:block" />
          <div className="relative flex flex-col items-center gap-6 rounded-3xl bg-gradient-to-br from-[#ECE8FA] to-[#DED4F5] px-8 py-10 dark:bg-neutral-900 md:flex-row md:justify-between">
            <div className="flex items-center gap-6">
              <div className="relative hidden sm:block">
                <MascotIllustration className="w-20" />
                <MotionLines color="#FF6B4A" className="absolute -left-3 -top-2" />
              </div>
              <div>
                <h2 className="relative inline-block text-2xl font-bold text-[#2B2118] dark:text-neutral-100" style={{ fontFamily: "var(--font-fredoka), sans-serif" }}>
                  <span className="relative">
                    Start
                    <Squiggle color="#FF6B4A" width={45} className="absolute -bottom-1.5 left-0" />
                  </span>{" "}
                  <span className="text-[#4C3AA0]">training today.</span>
                </h2>
                <p className="mt-1 text-sm text-[#6B5D4F] dark:text-neutral-400">
                  Free to use. No credit required. Just you and the next well-matched problem.
                </p>
              </div>
            </div>
            <Show when="signed-in">
              <RippleWrapper className="shrink-0 rounded-xl">
                <Link href="/onboarding" className="flex items-center gap-2 rounded-xl bg-[#FF6B4A] px-6 py-3 text-sm font-semibold text-white">
                  Start Practicing <ArrowRight size={16} />
                </Link>
              </RippleWrapper>
            </Show>
            <Show when="signed-out">
              <RippleWrapper className="shrink-0 rounded-xl">
                <Link href="/sign-up" className="flex items-center gap-2 rounded-xl bg-[#FF6B4A] px-6 py-3 text-sm font-semibold text-white">
                  Start Practicing <ArrowRight size={16} />
                </Link>
              </RippleWrapper>
            </Show>
          </div>
        </section>
      </ScrollReveal>

      <style>{`
        @keyframes twinkle-a { 0%, 100% { opacity: 0.9; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.85); } }
        @keyframes twinkle-b { 0%, 100% { opacity: 0.5; transform: scale(1) translateY(0); } 50% { opacity: 1; transform: scale(1.1) translateY(-3px); } }
        @keyframes twinkle-c { 0%, 100% { opacity: 0.7; transform: translateY(0); } 50% { opacity: 0.3; transform: translateY(3px); } }
        .animate-twinkle-a { animation: twinkle-a 4.5s ease-in-out infinite; }
        .animate-twinkle-b { animation: twinkle-b 5.5s ease-in-out infinite; }
        .animate-twinkle-c { animation: twinkle-c 6s ease-in-out infinite; }
      `}</style>
    </div>
  );
}