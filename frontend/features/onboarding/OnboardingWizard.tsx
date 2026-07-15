"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EXAM_TYPES } from "@/lib/exam-types";

interface TopicNode {
  id: string;
  slug: string;
  name: string;
  children: { id: string; slug: string; name: string }[];
}

export function OnboardingWizard({ categories }: { categories: TopicNode[] }) {
  const router = useRouter();
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [examTypes, setExamTypes] = useState<string[]>([]);
  const [categorySlugs, setCategorySlugs] = useState<string[]>([]);
  const [subtopicSlugs, setSubtopicSlugs] = useState<string[]>([]);

  const selectedCategories = categories.filter((c) => categorySlugs.includes(c.slug));
  // Subtopic step only makes sense when exactly one category was picked —
  // with multiple categories, their subtopics don't combine meaningfully,
  // so we skip straight to practice instead of a confusing mixed list.
  const showSubtopicStep =
    selectedCategories.length === 1 && selectedCategories[0].children.length > 0;

  function goToPractice(topics: string[]) {
    const params = new URLSearchParams();
    if (examTypes.length > 0) params.set("examTypes", examTypes.join(","));
    if (topics.length > 0) params.set("topicFocus", topics.join(","));
    router.push(`/practice${params.toString() ? `?${params}` : ""}`);
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
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col justify-center px-6">
      <div className="mb-10 flex items-center gap-2 font-mono text-xs tracking-widest text-neutral-500">
        <StepDot active={step >= 0} />
        <StepLine />
        <StepDot active={step >= 1} />
        <StepLine />
        <StepDot active={step >= 2} />
      </div>

      {step === 0 && (
        <StepPanel
          title="What are you preparing for?"
          subtitle="Pick as many as apply — this shapes which questions you'll see."
          onSelectAll={() => setExamTypes(EXAM_TYPES.map((e) => e.code))}
          onSkip={() => {
            setExamTypes([]);
            setStep(1);
          }}
          onContinue={() => setStep(1)}
        >
          <div className="grid grid-cols-2 gap-3">
            {EXAM_TYPES.map((e) => (
              <PickButton
                key={e.code}
                selected={examTypes.includes(e.code)}
                onClick={() => toggle(examTypes, setExamTypes, e.code)}
              >
                {e.label}
              </PickButton>
            ))}
          </div>
        </StepPanel>
      )}

      {step === 1 && (
        <StepPanel
          title="Any areas you want to focus on?"
          subtitle="Pick as many as apply, or skip to practice a mix of everything."
          onSelectAll={() => setCategorySlugs(categories.map((c) => c.slug))}
          onSkip={() => goToPractice([])}
          onBack={() => setStep(0)}
          onContinue={handleCategoryContinue}
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
          onSelectAll={() =>
            setSubtopicSlugs(selectedCategories[0].children.map((c) => c.slug))
          }
          onSkip={() => goToPractice(categorySlugs)}
          onBack={() => setStep(1)}
          onContinue={() =>
            goToPractice(subtopicSlugs.length > 0 ? subtopicSlugs : categorySlugs)
          }
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
    </div>
  );
}

function StepPanel({
  title,
  subtitle,
  onSelectAll,
  onSkip,
  onBack,
  onContinue,
  children,
}: {
  title: string;
  subtitle: string;
  onSelectAll: () => void;
  onSkip: () => void;
  onBack?: () => void;
  onContinue: () => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-neutral-100">{title}</h1>
      <p className="mt-2 text-sm text-neutral-400">{subtitle}</p>
      <div className="mt-8">{children}</div>

      <div className="mt-6 flex items-center gap-4 text-sm">
        <button onClick={onSelectAll} className="text-[#5B8DEF] hover:text-[#7BA3F5]">
          Select all
        </button>
        <button onClick={onSkip} className="text-neutral-500 hover:text-neutral-300">
          Skip this step
        </button>
      </div>

      <div className="mt-8 flex items-center justify-between">
        {onBack ? (
          <button onClick={onBack} className="text-sm text-neutral-500 hover:text-neutral-300">
            ← Back
          </button>
        ) : (
          <span />
        )}
        <button
          onClick={onContinue}
          className="rounded-lg bg-[#5B8DEF] px-5 py-2 text-sm font-medium text-white hover:bg-[#4A7CDE]"
        >
          Continue →
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
      className={`rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
        selected
          ? "border-[#5B8DEF] bg-[#5B8DEF]/10 text-neutral-100"
          : "border-neutral-800 bg-neutral-900 text-neutral-200 hover:border-neutral-700"
      }`}
    >
      <span className="mr-2">{selected ? "☑" : "☐"}</span>
      {children}
    </button>
  );
}

function StepDot({ active }: { active: boolean }) {
  return <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-[#5B8DEF]" : "bg-neutral-700"}`} />;
}

function StepLine() {
  return <span className="h-px w-8 bg-neutral-800" />;
}