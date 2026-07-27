import { renderMathText } from "@/lib/render-math";

interface ReviewAttempt {
  status: string;
  question: {
    externalId: string;
    statement: string;
    answerType: string;
    options: Record<string, string> | null;
    correctAnswer: string;
    solutionMarkdown: string;
    diagramSvg: string | null;
  };
}

export function AttemptReviewView({ attempt }: { attempt: ReviewAttempt }) {
  const isSolved = attempt.status === "SOLVED";
  const q = attempt.question;

  return (
    <div>
      <div className="w-fit rounded-full bg-[#ECE8FA] px-3 py-1 text-xs font-semibold text-[#4C3AA0] dark:bg-indigo-950/40 dark:text-indigo-300">
        Reviewing a past attempt
      </div>

      <div className="mt-4 text-base leading-relaxed text-[#2B2118] dark:text-neutral-100" dangerouslySetInnerHTML={{ __html: renderMathText(q.statement) }} />

      {q.diagramSvg && (
        <div className="my-6 flex justify-center rounded-lg border border-[#F0E6D6] bg-white p-4 dark:border-neutral-800" dangerouslySetInnerHTML={{ __html: q.diagramSvg }} />
      )}

      <div
        className={`mt-4 rounded-lg border px-4 py-3 text-sm ${
          isSolved
            ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
            : "border-red-300 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
        }`}
      >
        {isSolved ? "You solved this one." : attempt.status === "SURRENDERED" ? "You gave up on this one." : "You got this one wrong."}
      </div>

      {q.answerType === "MCQ" && q.options && (
        <div className="mt-4 flex flex-col gap-2">
          {Object.entries(q.options).map(([key, val]) => {
            const isCorrectOption = key === q.correctAnswer;
            return (
              <div
                key={key}
                className={`rounded-lg border px-4 py-3 text-left text-sm ${
                  isCorrectOption
                    ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
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

      {q.answerType !== "MCQ" && (
        <div className="mt-4 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          Correct answer: {q.correctAnswer}
        </div>
      )}

      <div className="mt-6 border-t border-[#F0E6D6] pt-4 dark:border-neutral-800">
        <div className="mb-2 text-sm font-medium text-[#2B2118] dark:text-neutral-300">Solution</div>
        <div className="text-sm leading-relaxed text-[#2B2118]/90 dark:text-neutral-300" dangerouslySetInnerHTML={{ __html: renderMathText(q.solutionMarkdown) }} />
      </div>
    </div>
  );
}