"use client";

import { ArrowLeft } from "lucide-react";

export function BackButton({ label = "Back" }: { label?: string }) {
  return (
    <button
      onClick={() => window.history.back()}
      className="mb-8 flex items-center gap-1.5 text-sm text-[#6B5D4F] transition-colors hover:text-[#2B2118] dark:text-neutral-400 dark:hover:text-neutral-200"
    >
      <ArrowLeft size={16} /> {label}
    </button>
  );
}