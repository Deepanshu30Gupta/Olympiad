"use client";

const EXAMS = ["IOQM", "PRMO", "RMO", "INMO", "AMC 10", "AMC 12", "NMTC", "AIME", "USAMO/USAJMO", "China MO"];

export function ExamMarquee() {
  const items = [...EXAMS, ...EXAMS];

  return (
    <div className="relative overflow-hidden py-2">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#FFFBF2] to-transparent dark:from-neutral-950" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#FFFBF2] to-transparent dark:from-neutral-950" />

      <div className="flex w-max animate-marquee gap-3">
        {items.map((exam, i) => (
          <span
            key={`${exam}-${i}`}
            className="inline-block whitespace-nowrap rounded-full bg-[#ECE8FA] px-4 py-2 text-sm font-bold text-[#4C3AA0] transition-all duration-200 ease-out hover:scale-105 hover:shadow-md dark:bg-indigo-950/40 dark:text-indigo-300"
          >
            {exam}
          </span>
        ))}
      </div>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 32s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}