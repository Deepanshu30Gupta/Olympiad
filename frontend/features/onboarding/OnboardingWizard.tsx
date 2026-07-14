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
  const [examType, setExamType] = useState<string | null>(null);
  const [category, setCategory] = useState<TopicNode | null>(null);

  function goToPractice(topicFocus: string | null) {
    const params = new URLSearchParams();
    if (examType) params.set("examType", examType);
    if (topicFocus) params.set("topicFocus", topicFocus);
    router.push(`/practice${params.toString() ? `?${params}` : ""}`);
  }

  function handleExamPick(code: string) {
    setExamType(code);
    setStep(1);
  }

  function handleCategoryPick(cat: TopicNode) {
    setCategory(cat);
    if (cat.children.length === 0) {
      goToPractice(cat.slug);
    } else {
      setStep(2);
    }
  }

  function handleSubtopicPick(slug: string) {
    goToPractice(slug);
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
          subtitle="This shapes which questions you'll see first."
          onSkip={() => goToPractice(null)}
        >
          <div className="grid grid-cols-2 gap-3">
            {EXAM_TYPES.map((e) => (
              <PickButton key={e.code} onClick={() => handleExamPick(e.code)}>
                {e.label}
              </PickButton>
            ))}
          </div>
        </StepPanel>
      )}

      {step === 1 && (
        <StepPanel
          title="Any area you want to focus on?"
          subtitle="You can practice a mix of everything instead — that's fine too."
          onSkip={() => goToPractice(null)}
          onBack={() => setStep(0)}
        >
          <div className="grid grid-cols-2 gap-3">
            {categories.map((c) => (
              <PickButton key={c.id} onClick={() => handleCategoryPick(c)}>
                {c.name}
              </PickButton>
            ))}
          </div>
        </StepPanel>
      )}

      {step === 2 && category && (
        <StepPanel
          title={`Narrow it down within ${category.name}?`}
          subtitle="Optional — skip to practice the whole category."
          onSkip={() => goToPractice(category.slug)}
          onBack={() => setStep(1)}
        >
          <div className="grid grid-cols-2 gap-3">
            {category.children.map((sub) => (
              <PickButton key={sub.id} onClick={() => handleSubtopicPick(sub.slug)}>
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
  onSkip,
  onBack,
  children,
}: {
  title: string;
  subtitle: string;
  onSkip: () => void;
  onBack?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-neutral-100">{title}</h1>
      <p className="mt-2 text-sm text-neutral-400">{subtitle}</p>
      <div className="mt-8">{children}</div>
      <div className="mt-8 flex items-center justify-between text-sm">
        {onBack ? (
          <button onClick={onBack} className="text-neutral-500 hover:text-neutral-300">
            ← Back
          </button>
        ) : (
          <span />
        )}
        <button onClick={onSkip} className="text-neutral-500 hover:text-neutral-300">
          Skip this step →
        </button>
      </div>
    </div>
  );
}

function PickButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 text-left text-sm text-neutral-200 transition-colors hover:border-[#5B8DEF] hover:bg-neutral-800"
    >
      {children}
    </button>
  );
}

function StepDot({ active }: { active: boolean }) {
  return (
    <span
      className={`h-1.5 w-1.5 rounded-full ${active ? "bg-[#5B8DEF]" : "bg-neutral-700"}`}
    />
  );
}

function StepLine() {
  return <span className="h-px w-8 bg-neutral-800" />;
}