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

type LoadingAction = "continue" | "skip" | null;

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
  const [loadingAction, setLoadingAction] = useState<LoadingAction>(null);

  const selectedCategories = categories.filter((c) => categorySlugs.includes(c.slug));
  const showSubtopicStep =
    selectedCategories.length === 1 && selectedCategories[0].children.length > 0;

  // The indicator (and step numbering) reflects however many steps are
  // ACTUALLY reachable given current selections — 2 steps once more than
  // one category is picked (or one with no subtopics), not always 3.
  const stepLabels = showSubtopicStep
    ? ["Exam focus", "Topic areas", "Subtopics"]
    : ["Exam focus", "Topic areas"];

  async function goToPractice(topics: string[], action: LoadingAction) {
    setLoadingAction(action);
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
      setLoadingAction(null);
    }
  }

  function toggle(list: string[], setList: (v: string[]) => void, value: string) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  // Dedicated category toggle — also resets subtopic selection, since a
  // previously chosen subtopic no longer makes sense once the category
  // set has changed (this was the reported bug: going back and picking
  // a different category left the old subtopic selection lingering).
  function toggleCategory(slug: string) {
    setCategorySlugs((prev) => (prev.includes(slug) ? prev.filter((v) => v !== slug) : [...prev, slug]));
    setSubtopicSlugs([]);
  }

  function handleCategoryContinue() {
    if (showSubtopicStep) {
      setStep(2);
    } else {
      goToPractice(categorySlugs, "continue");
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col px-6 pt-16 text-[#2B2118] dark:text-neutral-100">
      <div className="mb-10 flex items-center justify-center">
        {stepLabels.map((label, i) => (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-2">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${
                  i < step
                    ? "bg-[#6FCF52] text-white"
                    : i === step
                      ? "scale-110 bg-[#FF6B4A] text-white shadow-lg shadow-[#FF6B4A]/30"
                      : "bg-[#F0E6D6] text-[#6B5D4F] dark:bg-neutral-800 dark:text-neutral-500"
                }`}
              >
                {i < step ? "✓" : i + 1}
              </div>
              <span
                className={`text-[10px] font-semibold uppercase tracking-wide ${
                  i === step ? "text-[#2B2118] dark:text-neutral-100" : "text-[#6B5D4F] dark:text-neutral-500"
                }`}
              >
                {label}
              </span>
            </div>
            {i < stepLabels.length - 1 && (
              <div
                className={`mx-2 mb-4 h-1 w-12 rounded-full transition-colors duration-300 ${
                  i < step ? "bg-[#6FCF52]" : "bg-[#F0E6D6] dark:bg-neutral-800"
                }`}
              />
            )}
          </div>
        ))}
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
          loadingAction={loadingAction}
          requireSelection={true}
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
          onClearAll={() => {
            setCategorySlugs([]);
            setSubtopicSlugs([]);
          }}
          onSkip={() => goToPractice([], "skip")}
          onBack={() => setStep(0)}
          onContinue={handleCategoryContinue}
          loadingAction={loadingAction}
          requireSelection={true}
        >
          <div className="grid grid-cols-2 gap-3">
            {categories.map((c) => (
              <PickButton
                key={c.id}
                selected={categorySlugs.includes(c.slug)}
                onClick={() => toggleCategory(c.slug)}
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
          onSkip={() => goToPractice(categorySlugs, "skip")}
          onBack={() => setStep(1)}
          onContinue={() =>
            goToPractice(subtopicSlugs.length > 0 ? subtopicSlugs : categorySlugs, "continue")
          }
          loadingAction={loadingAction}
          requireSelection={true}
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
  loadingAction,
  requireSelection,
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
  loadingAction: LoadingAction;
  // Step 0 (exam focus) is fine with 0 selected + Continue (it's genuinely
  // optional to have an exam preference). Steps 1/2 require picking
  // SOMETHING to Continue — 0 selected there means "use Skip instead."
  requireSelection: boolean;
  children: React.ReactNode;
}) {
  const isLoading = loadingAction !== null;
  const continueDisabled = isLoading || (requireSelection && selectedCount === 0);

  return (
    <div>
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="mt-2 text-sm text-[#6B5D4F] dark:text-neutral-400">{subtitle}</p>
      </div>

      <div className="mt-5 flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-[#6B5D4F] dark:text-neutral-500">
            {selectedCount} selected
          </span>
          {selectedCount > 0 && (
            <button
              onClick={onClearAll}
              className="text-xs font-medium text-[#6B5D4F] underline decoration-dotted transition-colors hover:text-[#2B2118] dark:text-neutral-500 dark:hover:text-neutral-200"
            >
              Clear
            </button>
          )}
        </div>
        <button
          onClick={onSelectAll}
          className="font-medium text-[#4C3AA0] transition-colors hover:text-[#6650C4] dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          Select all
        </button>
      </div>

      <div className="mt-4">{children}</div>

      <div className="mt-8 flex items-center justify-between">
        {onBack ? (
          <button
            onClick={onBack}
            disabled={isLoading}
            className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-[#6B5D4F] transition-colors hover:bg-[#F0E6D6] hover:text-[#2B2118] dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
          >
            ← Back
          </button>
        ) : (
          <span />
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={onSkip}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-lg border border-[#F0E6D6] bg-white px-4 py-2.5 text-sm font-medium text-[#6B5D4F] transition-colors hover:border-[#FF6B4A]/40 hover:text-[#2B2118] disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
          >
            {loadingAction === "skip" && <Spinner />}
            Skip this step
          </button>
          <button
            onClick={onContinue}
            disabled={continueDisabled}
            className="flex items-center gap-2 rounded-lg bg-[#FF6B4A] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#D9502F] hover:shadow-md active:scale-[0.98] disabled:opacity-50 dark:bg-[#FF7A5C] dark:hover:bg-[#FF6B4A]"
          >
            {loadingAction === "continue" && <Spinner />}
            Continue →
          </button>
        </div>
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