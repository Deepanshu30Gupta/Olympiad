"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSessionAction, updateSessionFocusAction } from "@/app/practice/actions";
import { Spinner } from "@/components/ui/Spinner";

interface TopicNode {
  id: string;
  slug: string;
  name: string;
  children: { id: string; slug: string; name: string }[];
}

interface ExamTypeOption {
  code: string;
  label: string;
}

const STEP_LABELS = ["Exam focus", "Topic areas", "Subtopics"];

export function OnboardingWizard({
  categories,
  availableExamTypes,
  existingSessionId,
}: {
  categories: TopicNode[];
  availableExamTypes: ExamTypeOption[];
  existingSessionId?: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [examTypes, setExamTypes] = useState<string[]>([]);
  const [categorySlugs, setCategorySlugs] = useState<string[]>([]);
  const [subtopicSlugs, setSubtopicSlugs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const selectedCategories = categories.filter((c) => categorySlugs.includes(c.slug));
  const showSubtopicStep =
    selectedCategories.length === 1 && selectedCategories[0].children.length > 0;

  async function goToPractice(topics: string[]) {
    setSubmitting(true);
    setError(null);
    try {
      if (existingSessionId) {
        const res = await updateSessionFocusAction(existingSessionId, examTypes, topics);
        if (res.error) {
          setError(res.error);
          return;
        }
        router.push(`/practice?sessionId=${existingSessionId}`);
      } else {
        const res = await createSessionAction(examTypes, topics);
        if (res.error || !res.sessionId) {
          setError(res.error ?? "Something went wrong.");
          return;
        }
        router.push(`/practice?sessionId=${res.sessionId}`);
      }
    } finally {
      setSubmitting(false);
    }
  }

  function toggle(list: string[], setList: (v: string[]) => void, value: string) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  function handleCategoryContinue() {
    if (showSubtopicStep) {
      setStep(2);
    } else {
      goToPractice(categorySlugs);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col justify-center px-6 text-[#2B2118] dark:text-neutral-100">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {STEP_LABELS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <span
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  step >= i ? "bg-[#FF6B4A]" : "bg-[#F0E6D6] dark:bg-neutral-700"
                }`}
              />
              {i < STEP_LABELS.length - 1 && <span className="h-px w-6 bg-[#F0E6D6] dark:bg-neutral-800" />}
            </div>
          ))}
        </div>
        <span className="font-mono text-xs text-[#6B5D4F] dark:text-neutral-500">
          Step {step + 1} of 3 · {STEP_LABELS[step]}
        </span>
      </div>

      {step === 0 && (
        <div className="mb-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-sm text-[#6B5D4F] transition-colors hover:text-[#2B2118] dark:text-neutral-500 dark:hover:text-neutral-200"
          >
            ← Dashboard
          </Link>
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      {step === 0 && (
        <StepPanel
          title="What are you preparing for?"
          subtitle="Pick as many as apply — this shapes which questions you'll see."
          selectedCount={examTypes.length}
          onSelectAll={() => setExamTypes(availableExamTypes.map((e) => e.code))}
          onClearAll={() => setExamTypes([])}
          onSkip={() => {
            setExamTypes([]);
            setStep(1);
          }}
          onContinue={() => setStep(1)}
          submitting={submitting}
        >
          {availableExamTypes.length === 0 ? (
            <p className="text-sm text-[#6B5D4F] dark:text-neutral-500">
              No exam-tagged questions available yet — skip this step for now.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {availableExamTypes.map((e) => (
                <PickButton
                  key={e.code}
                  selected={examTypes.includes(e.code)}
                  onClick={() => toggle(examTypes, setExamTypes, e.code)}
                >
                  {e.label}
                </PickButton>
              ))}
            </div>
          )}
        </StepPanel>
      )}

      {step === 1 && (
        <StepPanel
          title="Any areas you want to focus on?"
          subtitle="Pick as many as apply, or skip to practice a mix of everything."
          selectedCount={categorySlugs.length}
          onSelectAll={() => setCategorySlugs(categories.map((c) => c.slug))}
          onClearAll={() => setCategorySlugs([])}
          onSkip={() => goToPractice([])}
          onBack={() => setStep(0)}
          onContinue={handleCategoryContinue}
          submitting={submitting}
        >
          <div className="grid grid-cols-2 gap-3">
            {categories.map((c) => (
              <PickButton
                key={c.id}
                selected={categorySlugs.includes(c.slug)}
                onClick={() => toggle(categorySlugs, setCategorySlugs, c.slug)}
              >
                {c.name}
              </PickButton>
            ))}
          </div>
        </StepPanel>
      )}

      {step === 2 && showSubtopicStep && (
        <StepPanel
          title={`Narrow it down within ${selectedCategories[0].name}?`}
          subtitle="Optional — pick specific subtopics, or skip to practice the whole category."
          selectedCount={subtopicSlugs.length}
          onSelectAll={() => setSubtopicSlugs(selectedCategories[0].children.map((c) => c.slug))}
          onClearAll={() => setSubtopicSlugs([])}
          onSkip={() => goToPractice(categorySlugs)}
          onBack={() => setStep(1)}
          onContinue={() => goToPractice(subtopicSlugs.length > 0 ? subtopicSlugs : categorySlugs)}
          submitting={submitting}
        >
          <div className="grid grid-cols-2 gap-3">
            {selectedCategories[0].children.map((sub) => (
              <PickButton
                key={sub.id}
                selected={subtopicSlugs.includes(sub.slug)}
                onClick={() => toggle(subtopicSlugs, setSubtopicSlugs, sub.slug)}
              >
                {sub.name}
              </PickButton>
            ))}
          </div>
        </StepPanel>
      )}

      <p className="mt-8 text-center text-xs text-[#6B5D4F] dark:text-neutral-500">
        You can update your selections anytime.
      </p>
    </div>
  );
}

function StepPanel({
  title,
  subtitle,
  selectedCount,
  onSelectAll,
  onClearAll,
  onSkip,
  onBack,
  onContinue,
  submitting,
  children,
}: {
  title: string;
  subtitle: string;
  selectedCount: number;
  onSelectAll: () => void;
  onClearAll: () => void;
  onSkip: () => void;
  onBack?: () => void;
  onContinue: () => void;
  submitting: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="mt-2 text-sm text-[#6B5D4F] dark:text-neutral-400">{subtitle}</p>
        </div>
        <button
          onClick={onSkip}
          disabled={submitting}
          className="shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium text-[#6B5D4F] transition-colors hover:bg-[#F0E6D6] hover:text-[#2B2118] dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
        >
          Skip this step →
        </button>
      </div>

      <div className="mt-5 flex items-center justify-between text-sm">
        <span className="font-mono text-xs text-[#6B5D4F] dark:text-neutral-500">
          {selectedCount} selected
        </span>
        <div className="flex items-center gap-3">
          <button
            onClick={onSelectAll}
            className="font-medium text-[#4C3AA0] transition-colors hover:text-[#6650C4] dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            Select all
          </button>
          {selectedCount > 0 && (
            <button
              onClick={onClearAll}
              className="font-medium text-[#6B5D4F] transition-colors hover:text-[#2B2118] dark:text-neutral-500 dark:hover:text-neutral-200"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      <div className="mt-4">{children}</div>

      <div className="mt-8 flex items-center justify-between">
        {onBack ? (
          <button
            onClick={onBack}
            disabled={submitting}
            className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-[#6B5D4F] transition-colors hover:bg-[#F0E6D6] hover:text-[#2B2118] dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
          >
            ← Back
          </button>
        ) : (
          <span />
        )}
        <button
          onClick={onContinue}
          disabled={submitting}
          className="flex items-center gap-2 rounded-lg bg-[#FF6B4A] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#D9502F] hover:shadow-md active:scale-[0.98] disabled:opacity-60 dark:bg-[#FF7A5C] dark:hover:bg-[#FF6B4A]"
        >
          {submitting && <Spinner />}
          {submitting ? "Loading..." : "Continue →"}
        </button>
      </div>
    </div>
  );
}

function PickButton({
  children,
  selected,
  onClick,
}: {
  children: React.ReactNode;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg border px-4 py-3 text-left text-sm font-medium transition-all hover:shadow-sm active:scale-[0.98] ${
        selected
          ? "border-[#FF6B4A] bg-[#FFE8E0] text-[#2B2118] dark:border-[#FF7A5C] dark:bg-[#FF6B4A]/15 dark:text-neutral-100"
          : "border-[#F0E6D6] bg-white text-[#2B2118] hover:border-[#FF6B4A]/50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:border-neutral-700"
      }`}
    >
      {children}
    </button>
  );
}