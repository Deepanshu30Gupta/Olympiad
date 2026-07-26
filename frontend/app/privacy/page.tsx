import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FFFBF2] dark:bg-neutral-950">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <Link
          href="/"
          className="mb-8 flex items-center gap-1.5 text-sm text-[#6B5D4F] transition-colors hover:text-[#2B2118] dark:text-neutral-400 dark:hover:text-neutral-200"
        >
          <ArrowLeft size={16} /> Back to home
        </Link>

        <h1
          className="text-3xl font-extrabold text-[#2B2118] dark:text-neutral-100"
          style={{ fontFamily: "var(--font-fredoka), sans-serif" }}
        >
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-[#6B5D4F] dark:text-neutral-400">Last updated: 2026</p>

        <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
          This is a starting template, not final legal text — have this reviewed before treating
          it as your actual privacy policy.
        </div>

        <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed text-[#2B2118] dark:text-neutral-300">
          <div>
            <h2 className="text-lg font-bold text-[#2B2118] dark:text-neutral-100">What we collect</h2>
            <p className="mt-2">
              When you create an account, we collect your name and email address (via our
              authentication provider). As you use Qublem, we record your practice
              activity — which questions you attempt, whether you got them right, how long you
              spent, and hints used — to power the adaptive difficulty system and your progress
              dashboard. If you submit a report or feedback form, we collect the name, email,
              and (optionally) phone number you provide.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#2B2118] dark:text-neutral-100">How we use it</h2>
            <p className="mt-2">
              Your practice data is used solely to personalize your experience — matching you
              to appropriately difficult questions and showing your own progress. We do not
              sell your data to third parties.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#2B2118] dark:text-neutral-100">Third-party services</h2>
            <p className="mt-2">
              We use Clerk for authentication and Vercel/Neon for hosting and database
              infrastructure. These providers may process your data as part of delivering their
              services to us.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#2B2118] dark:text-neutral-100">Your choices</h2>
            <p className="mt-2">
              You can request deletion of your account and associated data at any time by
              contacting us through the feedback form.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}