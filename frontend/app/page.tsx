import Link from "next/link";
import { Fredoka, Plus_Jakarta_Sans } from "next/font/google";
import { Show } from "@clerk/nextjs";
import { EXAM_TYPES } from "@/lib/exam-types";

const fredoka = Fredoka({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-display" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-body" });

const HIGHLIGHT_EXAMS = ["IOQM", "RMO", "INMO", "AMC10", "AMC12", "AIME", "USAMO", "IMO"];

export default function HomePage() {
  const highlightLabels = EXAM_TYPES.filter((e) => HIGHLIGHT_EXAMS.includes(e.code)).map(
    (e) => (e.code === "IOQM" ? "IOQM / PRMO" : e.label)
  );

  return (
    <div
      className={`${fredoka.variable} ${jakarta.variable}`}
      style={{ background: "#FFFBF2", color: "#2B2118", fontFamily: "var(--font-body)" }}
    >
      <style>{`
        .font-display { font-family: var(--font-display), sans-serif; }
      `}</style>

      <div className="mx-auto max-w-5xl px-8">
        <nav className="flex items-center justify-between py-6">
          <div className="font-display flex items-center gap-2 text-xl font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF6B4A] text-white">
              C
            </span>
            Contendo
          </div>
          <div className="hidden gap-7 text-sm font-medium text-[#6B5D4F] sm:flex">
            <a href="#how-it-works">How it works</a>
            <a href="#features">Features</a>
            <a href="#exams">Exams covered</a>
          </div>
          <div className="flex items-center gap-3">
            <Show when="signed-out">
              <Link href="/sign-in" className="text-sm font-medium">
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="rounded-xl bg-[#FF6B4A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#D9502F]"
              >
                Get started
              </Link>
            </Show>
            <Show when="signed-in">
              <Link
                href="/dashboard"
                className="rounded-xl bg-[#FF6B4A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#D9502F]"
              >
                Go to dashboard
              </Link>
            </Show>
          </div>
        </nav>

        <section className="grid grid-cols-1 items-center gap-12 py-14 sm:grid-cols-2">
          <div>
            <div className="mb-5 inline-flex items-center rounded-full bg-[#ECE8FA] px-3.5 py-1.5 text-xs font-semibold text-[#4C3AA0]">
              Adaptive daily practice — think Duolingo, for olympiad math
            </div>
            <h1 className="font-display mb-4 text-5xl font-semibold leading-[1.1]">
              Prepare like a <span className="text-[#FF6B4A]">champion.</span>
            </h1>
            <p className="mb-7 max-w-md text-[17px] text-[#6B5D4F]">
              Adaptive practice for math olympiad prep. Every question adjusts to
              your level, so you&apos;re always working right at the edge of what
              you can solve.
            </p>
            <div className="flex gap-3.5">
              <Show when="signed-out">
                <Link
                  href="/sign-up"
                  className="rounded-2xl bg-[#FF6B4A] px-7 py-3.5 text-base font-semibold text-white hover:bg-[#D9502F]"
                >
                  Start practicing free
                </Link>
              </Show>
              <Show when="signed-in">
                <Link
                  href="/dashboard"
                  className="rounded-2xl bg-[#FF6B4A] px-7 py-3.5 text-base font-semibold text-white hover:bg-[#D9502F]"
                >
                  Go to dashboard
                </Link>
              </Show>
              <a
                href="#how-it-works"
                className="rounded-2xl px-7 py-3.5 text-base font-semibold text-[#2B2118]"
              >
                See how it works
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -right-4 -top-4 rounded-2xl bg-[#6FCF52] px-4 py-2.5 font-display text-sm font-bold text-[#1E4A12] shadow-lg">
              +40 today
            </div>
            <div className="rounded-3xl border border-[#F0E6D6] bg-white p-6 shadow-xl">
              <div className="mb-1 text-sm font-semibold text-[#6B5D4F]">Your rating</div>
              <div className="font-display text-4xl font-bold text-[#4C3AA0]">1,486</div>
              <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-[#ECE8FA]">
                <div
                  className="h-full rounded-full"
                  style={{ width: "68%", background: "linear-gradient(90deg, #4C3AA0, #FF6B4A)" }}
                />
              </div>
            </div>
          </div>
        </section>

        <section id="exams" className="border-y border-[#F0E6D6] py-7">
          <div className="mb-3.5 text-center text-sm font-semibold text-[#6B5D4F]">
            Built for olympiads around the world
          </div>
          <div className="flex flex-wrap justify-center gap-2.5">
            {highlightLabels.map((label) => (
              <span
                key={label}
                className="rounded-full border border-[#F0E6D6] bg-white px-4 py-2 text-sm font-semibold"
              >
                {label}
              </span>
            ))}
            <span className="rounded-full border border-[#F0E6D6] bg-white px-4 py-2 text-sm font-semibold text-[#6B5D4F]">
              +{EXAM_TYPES.length - HIGHLIGHT_EXAMS.length} more
            </span>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-5 py-14 sm:grid-cols-4">
          {[
            ["280+", "Curated questions"],
            ["6", "Topic areas"],
            [`${EXAM_TYPES.length}`, "Exams covered"],
            ["100%", "Adaptive difficulty"],
          ].map(([num, label]) => (
            <div key={label} className="text-center">
              <div className="font-display text-4xl font-bold text-[#FF6B4A]">{num}</div>
              <div className="mt-1 text-sm text-[#6B5D4F]">{label}</div>
            </div>
          ))}
        </section>

        <section id="how-it-works" className="py-14">
          <div className="mx-auto mb-11 max-w-lg text-center">
            <h2 className="font-display mb-3 text-3xl font-semibold">How it works</h2>
            <p className="text-[#6B5D4F]">
              No setup overhead. You&apos;re solving a well-matched problem within
              a minute of signing up.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
            {[
              ["1", "Create your account", "Takes seconds. Free to start."],
              ["2", "Pick your focus", "Choose an exam and topics, or skip and practice everything."],
              ["3", "Solve, adapt, repeat", "Each question is chosen to match your current level."],
              ["4", "Watch your rating climb", "Every attempt updates your skill rating, per topic."],
            ].map(([n, title, desc]) => (
              <div key={n} className="rounded-2xl border border-[#F0E6D6] bg-white p-6">
                <div className="font-display mb-3.5 flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFE8E0] font-bold text-[#D9502F]">
                  {n}
                </div>
                <h3 className="mb-1.5 font-semibold">{title}</h3>
                <p className="text-sm text-[#6B5D4F]">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="features" className="py-14">
          <div className="mx-auto mb-11 max-w-lg text-center">
            <h2 className="font-display mb-3 text-3xl font-semibold">
              Everything you need to train
            </h2>
            <p className="text-[#6B5D4F]">
              Built around one idea: the best question for you right now is
              rarely the same as the best question for anyone else.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {[
              ["Adaptive difficulty", "An Elo-style rating system, per topic, matches you to questions in your zone.", "#FFE8E0", "#D9502F"],
              ["Progressive hints", "Stuck? Reveal hints one level at a time instead of jumping straight to the answer.", "#ECE8FA", "#4C3AA0"],
              ["Topic-level tracking", "See exactly where you're strong and where you need more reps.", "#E6F7E0", "#2E6B1B"],
              ["Daily streaks", "Build a consistent practice habit, one session at a time.", "#FFE8E0", "#D9502F"],
              ["Resume anytime", "Close the tab mid-question, pick up exactly where you left off.", "#ECE8FA", "#4C3AA0"],
              ["Real worked solutions", "Every question comes with a full explanation, not just an answer key.", "#E6F7E0", "#2E6B1B"],
            ].map(([title, desc, bg, fg]) => (
              <div key={title} className="rounded-2xl border border-[#F0E6D6] bg-white p-6">
                <div
                  className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl text-lg font-bold"
                  style={{ background: bg, color: fg }}
                >
                  ●
                </div>
                <h3 className="mb-2 font-semibold">{title}</h3>
                <p className="text-sm text-[#6B5D4F]">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-14">
          <div className="grid grid-cols-1 gap-10 rounded-3xl bg-[#4C3AA0] p-12 text-white sm:grid-cols-2">
            <div>
              <h2 className="font-display mb-3.5 text-3xl font-semibold text-white">
                Why an adaptive rating, not a fixed course?
              </h2>
              <p className="mb-5 text-[#D8D2F0]">
                A fixed problem set treats every student the same. Contendo&apos;s
                rating system is closer to how competitive chess or puzzle
                platforms work — always finding the question that&apos;s
                genuinely useful for you right now.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {[
                "Too easy, and you're wasting time. Too hard, and you're just guessing.",
                "Every topic gets its own rating, so strengths and gaps stay visible.",
                "Questions recalibrate too — difficulty reflects how real students actually perform.",
                "No two students see the same sequence of problems.",
              ].map((text) => (
                <div key={text} className="flex gap-2.5 text-sm text-[#EDEAFA]">
                  <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#FFB238]" />
                  {text}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-14">
          <div className="rounded-3xl bg-[#FF6B4A] p-14 text-center">
            <h2 className="font-display mb-3 text-3xl font-semibold text-white">
              Start training today.
            </h2>
            <p className="mb-6 text-[#FFE3D9]">
              Free to use. No credit card. Just you and the next well-matched
              problem.
            </p>
            <Show when="signed-out">
              <Link
                href="/sign-up"
                className="rounded-2xl bg-white px-7 py-3.5 text-base font-semibold text-[#D9502F]"
              >
                Start practicing free
              </Link>
            </Show>
            <Show when="signed-in">
              <Link
                href="/dashboard"
                className="rounded-2xl bg-white px-7 py-3.5 text-base font-semibold text-[#D9502F]"
              >
                Go to dashboard
              </Link>
            </Show>
          </div>
        </section>

        <footer className="flex items-center justify-between border-t border-[#F0E6D6] py-8 text-sm text-[#6B5D4F]">
          <div className="font-display flex items-center gap-2 font-bold text-[#2B2118]">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FF6B4A] text-sm text-white">
              C
            </span>
            Contendo
          </div>
          <div className="flex gap-5">
            <Link href="/about">About</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/contact">Contact</Link>
          </div>
          <div>© 2026 Contendo</div>
        </footer>
      </div>
    </div>
  );
}