"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { renderMathText } from "@/lib/render-math";
import { submitAnswerAction, surrenderAction } from "@/app/practice/actions";
import { Spinner } from "@/components/ui/Spinner";
import { MathSymbolToolbar } from "@/features/questions/MathSymbolToolbar";
import { Eye } from "lucide-react";

interface Hint {
  level: number;
  content: string;
}

interface AttemptFormProps {
  sessionId: string;
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
  newScore: number;
  previousScore: number;
};

export function AttemptForm({
  sessionId,
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
  const [submittedAnswer, setSubmittedAnswer] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [pendingWrongResult, setPendingWrongResult] = useState<SubmitResult | null>(null);
  const [loadingAction, setLoadingAction] = useState<"submit" | "surrender" | "next" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const numericInputRef = useRef<HTMLInputElement>(null);

  const done = result !== null;

  useEffect(() => {
    if (done || pendingWrongResult) return;
    const interval = setInterval(() => {
      setElapsedSeconds(Math.round((Date.now() - startedAtMs.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [done, pendingWrongResult]);

  const canSurrender = elapsedSeconds >= surrenderLockSeconds;

  async function handleSubmit() {
    if (!answer.trim() || loadingAction) return;
    setLoadingAction("submit");
    setError(null);
    try {
      const res = await submitAnswerAction({
        sessionId,
        questionId,
        userAnswer: answer,
        startedAtMs: startedAtMs.current,
        hintLevelUsed: revealedHintLevel || null,
        confidenceRating: null,
      });
      if (res.error || res.correctAnswer === null) {
        setError(res.error ?? "Something went wrong.");
        return;
      }
      setSubmittedAnswer(answer);
      const finalResult: SubmitResult = {
        isCorrect: res.isCorrect ?? undefined,
        correctAnswer: res.correctAnswer,
        solutionMarkdown: res.solutionMarkdown ?? "",
        newScore: res.newScore ?? 0,
        previousScore: res.previousScore ?? res.newScore ?? 0,
      };
      if (res.isCorrect) {
        setResult(finalResult);
      } else {
        setPendingWrongResult(finalResult);
      }
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleSurrender() {
    if (!canSurrender || loadingAction) return;
    setLoadingAction("surrender");
    setError(null);
    try {
      const res = await surrenderAction({
        sessionId,
        questionId,
        startedAtMs: startedAtMs.current,
        hintLevelUsed: revealedHintLevel || null,
      });
      if (res.error || res.correctAnswer === null) {
        setError(res.error ?? "Something went wrong.");
        return;
      }
      setResult({
        correctAnswer: res.correctAnswer,
        solutionMarkdown: res.solutionMarkdown ?? "",
        newScore: res.newScore ?? 0,
        previousScore: res.previousScore ?? res.newScore ?? 0,
      });
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setLoadingAction(null);
    }
  }

  function handleNextQuestion() {
    setLoadingAction("next");
    router.refresh();
  }

  function revealFromPending() {
    if (pendingWrongResult) {
      setResult(pendingWrongResult);
      setPendingWrongResult(null);
    }
  }

  const nextHint = hints.find((h) => h.level === revealedHintLevel + 1);

  if (pendingWrongResult && !done) {
    return (
      <div className="mt-6">
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          Oops!! Wrong answer.
        </div>

        {revealedHintLevel > 0 && (
          <div className="mt-3 flex flex-col gap-2">
            {hints
              .filter((h) => h.level <= revealedHintLevel)
              .map((h) => (
                <div
                  key={h.level}
                  className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-200"
                >
                  Hint {h.level}: {h.content}
                </div>
              ))}
          </div>
        )}

        <p className="mt-4 text-sm text-[#6B5D4F] dark:text-neutral-400">
          {nextHint ? "Want a hint before we show the answer?" : "Ready to see the answer?"}
        </p>
        <div className="mt-3 flex gap-3">
          {nextHint && (
            <button
              onClick={() => setRevealedHintLevel(nextHint.level)}
              className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800 transition-colors hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-950/60 dark:text-amber-200 dark:hover:bg-amber-900/60"
            >
              Get a hint
            </button>
          )}
          <button
            onClick={revealFromPending}
            className="rounded-lg bg-[#FF6B4A] px-4 py-2 text-sm font-medium text-white hover:bg-[#D9502F]"
          >
            Show correct answer
          </button>
        </div>
      </div>
    );
  }

  if (result) {
    const showDelta = result.previousScore !== result.newScore;
    const delta = Math.round((result.newScore - result.previousScore) * 10) / 10;

    return (
      <div className="mt-6">
        {"isCorrect" in result && result.isCorrect !== undefined && (
          <div
            className={`rounded-lg border px-4 py-3 text-sm font-medium ${
              result.isCorrect
                ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                : "border-red-300 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
            }`}
          >
            {result.isCorrect ? "Yeahhh!! Correct answer!" : "Here's the answer:"}
          </div>
        )}
        {(!("isCorrect" in result) || result.isCorrect === undefined) && (
          <div className="rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            Correct answer: {result.correctAnswer}
          </div>
        )}

        {submittedAnswer && (
          <div
            className={`mt-2 rounded-lg border px-4 py-3 text-sm ${
              result.isCorrect
                ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                : "border-red-300 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
            }`}
          >
            Your answer: {submittedAnswer}
            {!result.isCorrect && result.isCorrect !== undefined && (
              <span className="ml-2 text-[#6B5D4F] dark:text-neutral-400">
                — Correct answer:{" "}
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                  {result.correctAnswer}
                </span>
              </span>
            )}
          </div>
        )}

        {answerType === "MCQ" && options && (
          <div className="mt-4 flex flex-col gap-2">
            {Object.entries(options).map(([key, val]) => {
              const isCorrectOption = key === result.correctAnswer;
              const isUserWrongPick = key === submittedAnswer && key !== result.correctAnswer;
              return (
                <div
                  key={key}
                  className={`rounded-lg border px-4 py-3 text-left text-sm ${
                    isCorrectOption
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                      : isUserWrongPick
                        ? "border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
                        : "border-[#F0E6D6] bg-white text-[#6B5D4F] dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400"
                  }`}
                >
                  <span className="mr-2 font-mono opacity-70">{key}.</span>
                  <span dangerouslySetInnerHTML={{ __html: renderMathText(val) }} />
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#6B5D4F] dark:text-neutral-500">Your rating:</span>
            <span
              className="font-bold text-[#2B2118] dark:text-neutral-100"
              style={{ fontFamily: "var(--font-fredoka, inherit)" }}
            >
              ★ {result.newScore}
            </span>
            {showDelta && (
              <span
                className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                  delta > 0
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                    : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400"
                }`}
              >
                {delta > 0 ? "▲" : "▼"} {Math.abs(delta)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#6B5D4F] dark:text-neutral-500">
            <span>Time:</span>
            <span className="font-mono text-[#2B2118] dark:text-neutral-300">
              {Math.floor(elapsedSeconds / 60)}:{String(elapsedSeconds % 60).padStart(2, "0")}
            </span>
          </div>
        </div>

        <div className="mt-6 border-t border-[#F0E6D6] pt-4 dark:border-neutral-800">
          <div className="mb-2 text-sm font-medium text-[#2B2118] dark:text-neutral-300">Solution</div>
          <div
            className="text-sm leading-relaxed text-[#2B2118]/90 dark:text-neutral-300"
            dangerouslySetInnerHTML={{ __html: renderMathText(result.solutionMarkdown) }}
          />
        </div>

        <button
          onClick={handleNextQuestion}
          disabled={loadingAction === "next"}
          className="mt-6 flex items-center gap-2 rounded-lg bg-[#5B8DEF] px-5 py-2 text-sm font-medium text-white hover:bg-[#4A7CDE] disabled:opacity-60"
        >
          {loadingAction === "next" && <Spinner />}
          Next Question →
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="mb-4 font-mono text-xs text-[#6B5D4F] dark:text-neutral-500">
        {Math.floor(elapsedSeconds / 60)}:{String(elapsedSeconds % 60).padStart(2, "0")}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      {answerType === "NUMERIC" && (
        <div>
          <input
            ref={numericInputRef}
            type="text"
            inputMode="numeric"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Your answer"
            className="w-full rounded-lg border border-[#F0E6D6] bg-white px-4 py-3 text-sm text-[#2B2118] outline-none focus:border-[#5B8DEF] dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
          />
          <MathSymbolToolbar inputRef={numericInputRef} onInsert={setAnswer} />
        </div>
      )}

      {answerType === "MCQ" && options && (
        <div className="flex flex-col gap-2">
          {Object.entries(options).map(([key, val]) => (
            <button
              key={key}
              onClick={() => setAnswer(key)}
              className={`rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                answer === key
                  ? "border-[#5B8DEF] bg-[#5B8DEF]/10 text-[#2B2118] dark:text-neutral-100"
                  : "border-[#F0E6D6] bg-white text-[#2B2118] hover:border-[#D8CBB5] dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:border-neutral-700"
              }`}
            >
              <span className="mr-2 font-mono text-[#6B5D4F] dark:text-neutral-500">{key}.</span>
              <span dangerouslySetInnerHTML={{ __html: renderMathText(val) }} />
            </button>
          ))}
        </div>
      )}

      {answerType === "PROOF" && (
        <div className="rounded-lg border border-[#F0E6D6] bg-white px-4 py-3 text-sm text-[#6B5D4F] dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
          Proof-based self-grading UI is a follow-up build, not in this pass.
        </div>
      )}

      {hints.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {hints.map((h) => {
            const alreadyRevealed = h.level <= revealedHintLevel;
            const isNextUnlockable = h.level === revealedHintLevel + 1;
            const locked = !alreadyRevealed && !isNextUnlockable;
            return (
              <button
                key={h.level}
                onClick={() => {
                  if (isNextUnlockable) setRevealedHintLevel(h.level);
                }}
                disabled={alreadyRevealed || locked}
                title={locked ? `Reveal Hint ${h.level - 1} first` : undefined}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  alreadyRevealed
                    ? "border-amber-300 bg-amber-50 text-amber-700 opacity-50 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300"
                    : locked
                      ? "cursor-not-allowed border-[#F0E6D6] bg-[#FFFBF2] text-[#B8A990] dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-600"
                      : "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-950/60 dark:text-amber-200 dark:hover:bg-amber-900/60"
                }`}
              >
                {locked ? "🔒 " : ""}
                Hint {h.level}
              </button>
            );
          })}
        </div>
      )}
      {revealedHintLevel > 0 && (
        <div className="mt-2 flex flex-col gap-2">
          {hints
            .filter((h) => h.level <= revealedHintLevel)
            .map((h) => (
              <div
                key={h.level}
                className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-200"
              >
                {h.content}
              </div>
            ))}
        </div>
      )}

      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={handleSubmit}
          disabled={!answer.trim() || loadingAction !== null}
          className="flex items-center gap-2 rounded-lg bg-[#5B8DEF] px-5 py-2 text-sm font-medium text-white hover:bg-[#4A7CDE] disabled:opacity-40"
        >
          {loadingAction === "submit" && <Spinner />}
          {loadingAction === "submit" ? "Submitting..." : "Submit"}
        </button>
        {/* "Give up" and "Show Solution" are two labels on the SAME real
            action — revealing the solution means surrendering the
            attempt in this system, so both genuinely trigger
            handleSurrender rather than one being a fake shortcut. */}
        <button
          onClick={handleSurrender}
          disabled={!canSurrender || loadingAction !== null}
          title={!canSurrender ? `Available after ${surrenderLockSeconds}s` : undefined}
          className="flex items-center gap-2 rounded-lg border border-[#F0E6D6] px-4 py-2 text-sm font-medium text-[#6B5D4F] hover:border-[#D8CBB5] disabled:opacity-30 dark:border-neutral-800 dark:text-neutral-400"
        >
          {loadingAction === "surrender" && <Spinner />}
          {canSurrender ? "Give Up" : `Give up (${surrenderLockSeconds - elapsedSeconds}s)`}
        </button>
        <button
          onClick={handleSurrender}
          disabled={!canSurrender || loadingAction !== null}
          title={!canSurrender ? `Available after ${surrenderLockSeconds}s` : undefined}
          className="flex items-center gap-1.5 text-sm text-[#6B5D4F] hover:text-[#2B2118] disabled:opacity-30 dark:text-neutral-500 dark:hover:text-neutral-300"
        >
          <Eye size={15} /> Show Solution
        </button>
      </div>
    </div>
  );
}