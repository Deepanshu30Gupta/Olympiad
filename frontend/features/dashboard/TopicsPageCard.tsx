"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

interface Mistake {
  externalId: string;
  statement: string;
}

export function TopicsPageCard({
  categoryName,
  stars,
  solved,
  wrong,
  totalQuestions,
  completed,
  mistakes,
}: {
  categoryName: string;
  stars: number;
  solved: number;
  wrong: number;
  totalQuestions: number;
  completed: number;
  mistakes: Mistake[];
}) {
  const [open, setOpen] = useState(false);
  const accuracy = solved + wrong > 0 ? Math.round((solved / (solved + wrong)) * 100) : 0;
  const progressPct = totalQuestions > 0 ? Math.min(100, Math.round((completed / totalQuestions) * 100)) : 0;

  return (
    <div className="rounded-2xl border border-[#F0E6D6] bg-white p-5 transition-all duration-200 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-[#2B2118] dark:text-neutral-100">{categoryName}</h3>
        <span className="font-bold text-[#4C3AA0] dark:text-indigo-400">★ {stars}</span>
      </div>

      <div className="mt-3 h-1.5 rounded-full bg-[#F0E6D6] dark:bg-neutral-800">
        <div className="h-1.5 rounded-full bg-[#FF6B4A]" style={{ width: `${progressPct}%` }} />
      </div>
      <div className="mt-1.5 flex justify-between text-xs text-[#6B5D4F] dark:text-neutral-500">
        <span>{completed} of {totalQuestions || "?"} questions</span>
        <span>{accuracy}% accuracy</span>
      </div>

      <button
        onClick={() => setOpen(!open)}
        className="mt-3 flex items-center gap-1 text-xs font-semibold text-[#4C3AA0] dark:text-indigo-400"
      >
        {open ? "Hide details" : "Show details"}
        <ChevronDown size={14} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="mt-3 border-t border-[#F0E6D6] pt-3 dark:border-neutral-800">
          {mistakes.length > 0 ? (
            <>
              <p className="text-xs font-semibold text-[#6B5D4F] dark:text-neutral-400">Recent mistakes</p>
              <ul className="mt-1.5 flex flex-col gap-1">
                {mistakes.map((m) => (
                  <li key={m.externalId} className="truncate text-xs text-[#8A7C6C] dark:text-neutral-500">
                    {m.externalId}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-xs text-[#8A7C6C] dark:text-neutral-500">No recent mistakes here — nice work.</p>
          )}
          <Link
            href="/onboarding"
            className="mt-3 inline-block rounded-lg bg-[#FF6B4A] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#D9502F]"
          >
            Practice this topic
          </Link>
        </div>
      )}
    </div>
  );
}