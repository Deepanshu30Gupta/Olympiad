"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { renderMathText } from "@/lib/render-math";
import { submitAnswerAction, surrenderAction } from "@/app/practice/actions";

interface Hint {
  level: number;
  content: string;
}

interface AttemptFormProps {
  questionId: string;
  answerType: "NUMERIC" | "MCQ" | "PROOF";
  options: Record<string, string> | null;
  hints: Hint[];
  surrenderLockSeconds: number;
}

type SubmitResult = {
  isCorrect?: boolean;
  correctAnswer: string;
  solutionMarkdown: string;
  newRating: number;
};

export function AttemptForm({
  questionId,
  answerType,
  options,
  hints,
  surrenderLockSeconds,
}: AttemptFormProps) {
  const startedAtMs = useRef(Date.now());
  const router = useRouter();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [revealedHintLevel, setRevealedHintLevel] = useState(0);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (result) return; // stop the timer once answered
    const interval = setInterval(() => {
      setElapsedSeconds(Math.round((Date.now() - startedAtMs.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [result]);

  const canSurrender = elapsedSeconds >= surrenderLockSeconds;

  async function handleSubmit() {
    if (!answer.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await submitAnswerAction({
        questionId,
        userAnswer: answer,
        startedAtMs: startedAtMs.current,
        hintLevelUsed: revealedHintLevel || null,
        confidenceRating: null, // confidence rating UI is a follow-up addition, not in this pass
      });
      setResult(res);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSurrender() {
    if (!canSurrender || submitting) return;
    setSubmitting(true);
    try {
      const res = await surrenderAction({
        questionId,
        startedAtMs: startedAtMs.current,
        hintLevelUsed: revealedHintLevel || null,
      });
      setResult(res);
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="mt-6">
        {"isCorrect" in result && (
          <div
            className={`rounded-lg border px-4 py-3 text-sm font-medium ${
              result.isCorrect
                ? "border-emerald-800 bg-emerald-950 text-emerald-300"
                : "border-red-900 bg-red-950 text-red-300"
            }`}
          >
            {result.isCorrect ? "Correct." : `Not quite. Correct answer: ${result.correctAnswer}`}
          </div>
        )}
        {!("isCorrect" in result) && (
          <div className="rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm text-neutral-300">
            Correct answer: {result.correctAnswer}
          </div>
        )}

        <div className="mt-4 font-mono text-xs text-neutral-500">
          Updated rating: {result.newRating}
        </div>

        <div className="mt-6 border-t border-neutral-800 pt-4">
          <div className="mb-2 text-sm font-medium text-neutral-300">Solution</div>
          <div
            className="text-sm leading-relaxed text-neutral-300"
            dangerouslySetInnerHTML={{ __html: renderMathText(result.solutionMarkdown) }}
          />
        </div>

        <button
          onClick={() => router.refresh()}
          className="mt-6 rounded-lg bg-[#5B8DEF] px-5 py-2 text-sm font-medium text-white hover:bg-[#4A7CDE]"
        >
          Next Question →
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="mb-4 font-mono text-xs text-neutral-500">
        {Math.floor(elapsedSeconds / 60)}:{String(elapsedSeconds % 60).padStart(2, "0")}
      </div>

      {answerType === "NUMERIC" && (
        <input
          type="text"
          inputMode="numeric"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Your answer"
          className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-neutral-100 outline-none focus:border-[#5B8DEF]"
        />
      )}

      {answerType === "MCQ" && options && (
        <div className="flex flex-col gap-2">
          {Object.entries(options).map(([key, val]) => (
            <button
              key={key}
              onClick={() => setAnswer(key)}
              className={`rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                answer === key
                  ? "border-[#5B8DEF] bg-[#5B8DEF]/10 text-neutral-100"
                  : "border-neutral-800 bg-neutral-900 text-neutral-200 hover:border-neutral-700"
              }`}
            >
              <span className="mr-2 font-mono text-neutral-500">{key}.</span>
              <span dangerouslySetInnerHTML={{ __html: renderMathText(val) }} />
            </button>
          ))}
        </div>
      )}

      {answerType === "PROOF" && (
        <div className="rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-neutral-400">
          Proof-based self-grading UI is a follow-up build, not in this pass.
        </div>
      )}

      {hints.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {hints.map((h) => (
            <button
              key={h.level}
              onClick={() => setRevealedHintLevel(Math.max(revealedHintLevel, h.level))}
              disabled={h.level <= revealedHintLevel}
              className="rounded-full border border-amber-900 bg-amber-950/40 px-3 py-1 text-xs text-amber-300 disabled:opacity-40"
            >
              Hint {h.level}
            </button>
          ))}
        </div>
      )}
      {revealedHintLevel > 0 && (
        <div className="mt-2 flex flex-col gap-2">
          {hints
            .filter((h) => h.level <= revealedHintLevel)
            .map((h) => (
              <div
                key={h.level}
                className="rounded-lg bg-amber-950/30 px-3 py-2 text-xs text-amber-200"
              >
                {h.content}
              </div>
            ))}
        </div>
      )}

      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={handleSubmit}
          disabled={!answer.trim() || submitting}
          className="rounded-lg bg-[#5B8DEF] px-5 py-2 text-sm font-medium text-white hover:bg-[#4A7CDE] disabled:opacity-40"
        >
          Submit
        </button>
        <button
          onClick={handleSurrender}
          disabled={!canSurrender || submitting}
          title={!canSurrender ? `Available after ${surrenderLockSeconds}s` : undefined}
          className="text-sm text-neutral-500 hover:text-neutral-300 disabled:opacity-30"
        >
          {canSurrender ? "Give up, show solution" : `Give up (available in ${surrenderLockSeconds - elapsedSeconds}s)`}
        </button>
      </div>
    </div>
  );
}