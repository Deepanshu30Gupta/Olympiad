import Link from "next/link";
import { Show } from "@clerk/nextjs";

export default function HomePage() {
  return (
    <div className="flex min-h-[calc(100vh-56px)] flex-col items-center justify-center px-6 text-center">
      <h1 className="max-w-2xl text-4xl font-semibold text-neutral-100">
        Adaptive practice for math olympiad prep.
      </h1>
      <p className="mt-4 max-w-xl text-neutral-400">
        IOQM, RMO, INMO, AMC and more — questions that adjust to your level,
        one attempt at a time.
      </p>

      <Show when="signed-in">
        <Link
          href="/dashboard"
          className="mt-8 rounded-lg bg-[#5B8DEF] px-6 py-3 text-sm font-medium text-white hover:bg-[#4A7CDE]"
        >
          Go to Dashboard →
        </Link>
      </Show>

      <Show when="signed-out">
        <div className="mt-8 flex gap-3">
          <Link
            href="/sign-up"
            className="rounded-lg bg-[#5B8DEF] px-6 py-3 text-sm font-medium text-white hover:bg-[#4A7CDE]"
          >
            Get Started
          </Link>
          <Link
            href="/sign-in"
            className="rounded-lg border border-neutral-800 px-6 py-3 text-sm font-medium text-neutral-300 hover:border-neutral-700"
          >
            Sign In
          </Link>
        </div>
      </Show>
    </div>
  );
}