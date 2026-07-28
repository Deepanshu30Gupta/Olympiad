import Link from "next/link";
import { ArrowLeft, Target, Brain, Trophy, Users } from "lucide-react";
import { Squiggle, PaperAirplane, Sparkle } from "@/features/home/decorations";

const VALUES = [
  { icon: Target, label: "Right practice", color: "#FF6B4A" },
  { icon: Brain, label: "Real progress", color: "#4C3AA0" },
  { icon: Trophy, label: "Stronger mathletes", color: "#FFB238" },
  { icon: Users, label: "Together", color: "#6FCF52" },
];

export default async function FounderStoryPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  const cameFromHome = params.from === "home";

  return (
    <div className="min-h-screen bg-[#FFFBF2] dark:bg-neutral-950">
      <div className="mx-auto max-w-3xl px-6 py-12">
        {cameFromHome && (
          <Link
            href="/#founder"
            className="mb-8 flex items-center gap-1.5 text-sm text-[#6B5D4F] transition-colors hover:text-[#2B2118] dark:text-neutral-400 dark:hover:text-neutral-200"
          >
            <ArrowLeft size={16} /> Back to home
          </Link>
        )}

        <h1
          className="relative inline-block text-4xl font-extrabold text-[#2B2118] dark:text-neutral-100"
          style={{ fontFamily: "var(--font-fredoka), sans-serif" }}
        >
          Why I built <span className="text-[#FF6B4A]">Qublem?</span>
          <Squiggle color="#FF6B4A" width={100} className="absolute -bottom-2 left-0" />
        </h1>

        <div className="relative mt-10 rounded-3xl bg-white p-8 shadow-sm dark:bg-neutral-900 md:p-12">
          <PaperAirplane color="#4C3AA0" className="pointer-events-none absolute -top-4 right-8 hidden sm:block" />
          <Sparkle size={16} color="#6FCF52" className="pointer-events-none absolute -left-2 top-1/2" />

          <span className="text-6xl leading-none text-[#FF6B4A]">&ldquo;</span>

          <div className="-mt-6 flex flex-col gap-5 text-[#2B2118] dark:text-neutral-200">
            <p>
              As someone who has been preparing for math olympiads myself, I know how hard it is
              to find the{" "}
              <mark className="rounded bg-[#FFE9A8] px-1 dark:bg-amber-900/40 dark:text-amber-200">
                right questions at the right level.
              </mark>
            </p>
            <p>
              Most resources are either too basic, too random, or scattered across the internet.
              I often ended up spending more time{" "}
              <mark className="rounded bg-[#FFE9A8] px-1 dark:bg-amber-900/40 dark:text-amber-200">
                searching for good problems
              </mark>{" "}
              than actually solving them.
            </p>
            <p>
              That&rsquo;s why I decided to build Qublem — a platform that brings{" "}
              <span className="font-bold text-[#4C3AA0] dark:text-indigo-400">
                quality, structured, and adaptive practice
              </span>{" "}
              for every math enthusiast, so that you can focus on what really matters:{" "}
              <span className="underline decoration-[#4C3AA0] decoration-2 underline-offset-2">
                improving.
              </span>
            </p>
            <p>
              Qublem is my attempt to make olympiad preparation simpler, smarter and more
              effective — for everyone who loves mathematics, just like I do.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 rounded-2xl border border-dashed border-[#F0E6D6] px-6 py-5 dark:border-neutral-700">
            {VALUES.map((v) => (
              <div key={v.label} className="flex items-center gap-2">
                <v.icon size={22} color={v.color} />
                <span className="text-sm font-semibold text-[#2B2118] dark:text-neutral-200">{v.label}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 text-right">
            <p className="font-serif text-lg italic text-[#2B2118] dark:text-neutral-200">
              — Deepanshu Gupta
            </p>
            <p className="text-xs text-[#6B5D4F] dark:text-neutral-500">Founder, Qublem</p>
          </div>
        </div>
      </div>
    </div>
  );
}