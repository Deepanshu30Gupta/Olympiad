"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const FAQS = [
  {
    q: "Is Qublem free?",
    a: "Yes — free to start, no credit card required.",
  },
  {
    q: "Which exams does Qublem cover?",
    a: "IOQM, PRMO, RMO, INMO, AMC 10, AMC 12, British Mathematical Olympiad, and Balkan Mathematical Olympiad, with more being added over time.",
  },
  {
    q: "How is this different from a normal problem set?",
    a: "Most practice resources organize problems by contest and year — the same fixed set for every student. Qublem organizes around you instead: every question is chosen based on your current rating in that specific topic, so you're always working on something genuinely useful, not just working through a list in order.",
  },
  {
    q: "Do I need to know which topics I'm weak in before I start?",
    a: "No. You can skip topic selection entirely and Qublem will serve a mix across everything, using your performance to figure out where you need more work as you go.",
  },
  {
    q: "What if I get stuck on a question?",
    a: "Progressive hints are available — reveal them one level at a time. If you're still stuck, you can give up and see the full worked solution.",
  },
  {
    q: "Can I come back to a question later?",
    a: "Yes — sessions are fully resumable. Close the tab mid-question and pick up exactly where you left off.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="flex flex-col gap-3">
      {FAQS.map((faq, i) => {
        const isOpen = openIndex === i;
        return (
          <div
            key={faq.q}
            className="rounded-2xl border border-[#F0E6D6] bg-white px-5 py-4 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="flex w-full items-center gap-3 text-left"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#4C3AA0] text-xs font-bold text-white">
                Q
              </span>
              <span
                className={`flex-1 text-sm font-semibold ${
                  isOpen ? "text-[#4C3AA0] dark:text-indigo-400" : "text-[#2B2118] dark:text-neutral-100"
                }`}
              >
                {faq.q}
              </span>
              {isOpen ? (
                <ChevronUp size={18} className="text-[#6B5D4F] dark:text-neutral-400" />
              ) : (
                <ChevronDown size={18} className="text-[#6B5D4F] dark:text-neutral-400" />
              )}
            </button>
            {isOpen && (
              <p className="ml-10 mt-2 text-sm text-[#6B5D4F] dark:text-neutral-400">{faq.a}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}