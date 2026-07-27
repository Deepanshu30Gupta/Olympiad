import Image from "next/image";
import Link from "next/link";
import { Heart, ArrowRight } from "lucide-react";
import { MascotIllustration } from "./MascotIllustration";

export function FounderSection() {
  return (
    <div className="rounded-3xl border border-[#F0E6D6] bg-white p-8 dark:border-neutral-800 dark:bg-neutral-900 md:p-10">
      <div className="grid items-center gap-8 md:grid-cols-[220px_1fr_140px]">
        {/*
          IMPORTANT: this references /founder-photo.jpg, which does not
          exist yet. Add the real founder photo to `frontend/public/`
          with that exact filename (or change the path below) — this
          is a real person's photo and isn't something to fabricate.
        */}
        <div className="relative mx-auto h-48 w-48 overflow-hidden rounded-2xl bg-[#F0E6D6] md:mx-0">
          <Image
            src="/founder-photo.jpeg"
            alt="Deepanshu Gupta, Founder of Qublem"
            fill
            className="object-cover"
          />
        </div>

        <div>
          <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#FFE8E0] px-3 py-1 text-xs font-semibold text-[#D9502F] dark:bg-[#FF6B4A]/15 dark:text-[#FF9478]">
            <Heart size={12} /> Building Qublem
          </div>
          <h2
            className="mt-3 text-2xl font-bold text-[#2B2118] dark:text-neutral-100"
            style={{ fontFamily: "var(--font-fredoka), sans-serif" }}
          >
            Why I built <span className="text-[#FF6B4A] underline decoration-2 underline-offset-4">Qublem</span>
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#6B5D4F] dark:text-neutral-400">
            As someone who has been preparing for math olympiads myself, I know how hard it is
            to find the right questions at the right level.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-[#6B5D4F] dark:text-neutral-400">
            Qublem is my attempt to make olympiad preparation simpler, smarter and more
            effective — for everyone who loves mathematics, just like I do.
          </p>
          <p className="mt-4 text-sm">
            <span className="font-semibold italic text-[#2B2118] dark:text-neutral-200">
              — Deepanshu Gupta
            </span>
            <br />
            <span className="text-xs text-[#6B5D4F] dark:text-neutral-500">Founder, Qublem</span>
          </p>
          <Link
            href="/story"
            className="mt-5 flex w-fit items-center gap-2 rounded-lg border border-[#F0E6D6] px-4 py-2 text-sm font-semibold text-[#2B2118] hover:border-[#FF6B4A]/50 dark:border-neutral-700 dark:text-neutral-100"
          >
            Read my full story <ArrowRight size={14} />
          </Link>
        </div>

        <MascotIllustration className="mx-auto hidden w-28 md:block" />
      </div>
    </div>
  );
}