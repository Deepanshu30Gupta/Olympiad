import Link from "next/link";
import { Show } from "@clerk/nextjs";

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-56px)] bg-[#FFFBF2] dark:bg-neutral-950">
      <div className="mx-auto grid max-w-5xl items-center gap-10 px-6 py-20 md:grid-cols-2">
        <div>
          <h1
            className="text-4xl font-semibold leading-tight text-[#2B2118] dark:text-neutral-100"
            style={{ fontFamily: "var(--font-fredoka), sans-serif" }}
          >
            Prepare like a <span className="text-[#FF6B4A]">champion.</span>
          </h1>
          <p className="mt-4 max-w-md text-[#6B5D4F] dark:text-neutral-400">
            Adaptive practice for math olympiad prep — IOQM, RMO, INMO, AMC and more. Every
            question adjusts to your level, one attempt at a time.
          </p>

          <Show when="signed-in">
            <Link
              href="/dashboard"
              className="mt-8 inline-block rounded-xl bg-[#FF6B4A] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#D9502F] hover:shadow-md active:scale-[0.98]"
            >
              Go to Dashboard →
            </Link>
          </Show>
          <Show when="signed-out">
            <div className="mt-8 flex gap-3">
              <Link
                href="/sign-up"
                className="rounded-xl bg-[#FF6B4A] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#D9502F] hover:shadow-md active:scale-[0.98]"
              >
                Get Started
              </Link>
              <Link
                href="/sign-in"
                className="rounded-xl border border-[#F0E6D6] px-6 py-3 text-sm font-semibold text-[#2B2118] transition-all hover:border-[#FF6B4A]/50 dark:border-neutral-800 dark:text-neutral-100"
              >
                Sign In
              </Link>
            </div>
          </Show>
        </div>

        <HeroIllustration />
      </div>
    </div>
  );
}

function HeroIllustration() {
  return (
    <svg viewBox="0 0 400 340" className="mx-auto w-full max-w-sm">
      {/* Central medal — the "champion" motif, no numbers on it */}
      <g transform="translate(200 190)">
        <circle r="70" fill="#FFE8E0" />
        <circle r="56" fill="#FF6B4A" />
        <path
          d="M -22 -8 L -8 10 L 24 -20"
          stroke="white"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path d="M 168 -190 L 232 -190 L 210 -130 L 190 -130 Z" fill="#4C3AA0" opacity="0" />
      </g>
      {/* Ribbon tails */}
      <path d="M 178 250 L 160 320 L 195 300 Z" fill="#D9502F" />
      <path d="M 222 250 L 240 320 L 205 300 Z" fill="#D9502F" />

      {/* Floating math-symbol badges, playful scatter */}
      <g transform="translate(70 60) rotate(-8)">
        <circle r="28" fill="#4C3AA0" />
        <text x="0" y="10" fontSize="26" fill="white" textAnchor="middle" fontFamily="var(--font-fredoka), sans-serif">
          π
        </text>
      </g>
      <g transform="translate(330 90) rotate(10)">
        <circle r="24" fill="#6FCF52" />
        <text x="0" y="9" fontSize="22" fill="white" textAnchor="middle" fontFamily="var(--font-fredoka), sans-serif">
          √
        </text>
      </g>
      <g transform="translate(60 220) rotate(6)">
        <circle r="22" fill="#FFB238" />
        <text x="0" y="8" fontSize="20" fill="white" textAnchor="middle" fontFamily="var(--font-fredoka), sans-serif">
          Σ
        </text>
      </g>
      <g transform="translate(345 230) rotate(-6)">
        <circle r="26" fill="#FF6B4A" />
        <text x="0" y="9" fontSize="24" fill="white" textAnchor="middle" fontFamily="var(--font-fredoka), sans-serif">
          ×
        </text>
      </g>
      <g transform="translate(200 30) rotate(4)">
        <circle r="18" fill="#4C3AA0" />
        <text x="0" y="7" fontSize="16" fill="white" textAnchor="middle" fontFamily="var(--font-fredoka), sans-serif">
          ∞
        </text>
      </g>

      {/* Subtle dashed orbit lines for playful motion feel */}
      <circle cx="200" cy="190" r="130" fill="none" stroke="#F0E6D6" strokeWidth="2" strokeDasharray="4 8" />
    </svg>
  );
}