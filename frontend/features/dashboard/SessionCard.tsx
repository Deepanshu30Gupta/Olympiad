"use client";

import { useState } from "react";
import Link from "next/link";
import { renameSessionAction } from "@/app/practice/actions";

interface SessionCardProps {
  id: string;
  name: string;
  status: string;
  startedAt: string;
  questionsCompleted: number;
  solved: number;
  wrong: number;
  surrendered: number;
  totalTimeSeconds: number;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function SessionCard({
  id,
  name,
  status,
  startedAt,
  questionsCompleted,
  solved,
  wrong,
  surrendered,
  totalTimeSeconds,
}: SessionCardProps) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [nameValue, setNameValue] = useState(name);
  const [saving, setSaving] = useState(false);

  async function saveRename() {
    if (!nameValue.trim() || nameValue === name) {
      setEditing(false);
      setNameValue(name);
      return;
    }
    setSaving(true);
    try {
      await renameSessionAction(id, nameValue);
    } finally {
      setSaving(false);
      setEditing(false);
    }
  }

  const dateLabel = new Date(startedAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="rounded-2xl border border-[#F0E6D6] bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {editing ? (
            <input
              autoFocus
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              onBlur={saveRename}
              onKeyDown={(e) => e.key === "Enter" && saveRename()}
              disabled={saving}
              className="rounded-lg border border-[#4C3AA0] px-2 py-1 text-sm font-semibold text-[#2B2118] dark:border-indigo-500 dark:bg-neutral-800 dark:text-neutral-100"
              style={{ fontFamily: "var(--font-fredoka), sans-serif" }}
            />
          ) : (
            <button
              onClick={() => setEditing(true)}
              title="Click to rename"
              className="text-base font-semibold text-[#2B2118] transition-colors hover:text-[#4C3AA0] dark:text-neutral-100 dark:hover:text-indigo-400"
              style={{ fontFamily: "var(--font-fredoka), sans-serif" }}
            >
              {name}
            </button>
          )}
          {status === "ACTIVE" && (
            <span className="rounded-full bg-[#E6F7E0] px-2 py-0.5 text-[11px] font-semibold text-[#2E6B1B] dark:bg-emerald-950 dark:text-emerald-300">
              Active
            </span>
          )}
        </div>
        <span className="text-xs text-[#6B5D4F] dark:text-neutral-500">{dateLabel}</span>
      </div>

      <div className="mt-2.5 flex gap-4 text-xs">
        <span className="text-[#2E6B1B] dark:text-emerald-400">{solved} solved</span>
        <span className="text-[#D9502F] dark:text-red-400">{wrong} wrong</span>
        <span className="text-[#6B5D4F] dark:text-neutral-500">{surrendered} gave up</span>
        <span className="ml-auto text-[#6B5D4F] dark:text-neutral-500">{formatTime(totalTimeSeconds)}</span>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <button
          onClick={() => setOpen(!open)}
          className="text-xs font-semibold text-[#4C3AA0] transition-colors hover:text-[#6650C4] dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          {open ? "Hide" : "Show"} details {open ? "▲" : "▼"}
        </button>
        {status === "ACTIVE" && (
          <Link
            href={`/practice?sessionId=${id}`}
            className="rounded-full bg-[#FF6B4A] px-3.5 py-1.5 text-xs font-semibold text-white transition-all hover:bg-[#D9502F] active:scale-[0.98] dark:bg-[#FF7A5C] dark:hover:bg-[#FF6B4A]"
          >
            Resume →
          </Link>
        )}
      </div>

      {open && (
        <div className="mt-3 border-t border-[#F0E6D6] pt-3 text-xs text-[#6B5D4F] dark:border-neutral-800 dark:text-neutral-400">
          {questionsCompleted} question{questionsCompleted !== 1 ? "s" : ""} completed in this session.
        </div>
      )}
    </div>
  );
}