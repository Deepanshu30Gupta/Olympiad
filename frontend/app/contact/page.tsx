import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { ReportWidget } from "@/components/ReportWidget";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#FFFBF2] dark:bg-neutral-950">
      <div className="mx-auto max-w-xl px-6 py-12 text-center">
        <Link
          href="/"
          className="mb-8 flex items-center gap-1.5 text-sm text-[#6B5D4F] transition-colors hover:text-[#2B2118] dark:text-neutral-400 dark:hover:text-neutral-200"
        >
          <ArrowLeft size={16} /> Back to home
        </Link>

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#ECE8FA] dark:bg-indigo-950/40">
          <Mail size={24} color="#4C3AA0" />
        </div>
        <h1
          className="mt-4 text-3xl font-extrabold text-[#2B2118] dark:text-neutral-100"
          style={{ fontFamily: "var(--font-fredoka), sans-serif" }}
        >
          Get in touch
        </h1>
        <p className="mt-3 text-sm text-[#6B5D4F] dark:text-neutral-400">
          Questions, feedback, or found something wrong? Use the form below and it&rsquo;ll come
          straight to us.
        </p>

        <div className="mt-8 flex justify-center">
          <ReportWidget
            triggerLabel="Open the contact form"
            triggerClassName="rounded-xl bg-[#FF6B4A] px-6 py-3 text-sm font-semibold text-white hover:bg-[#D9502F]"
          />
        </div>
      </div>
    </div>
  );
}