"use client";

import { useState } from "react";
import { Mail, Check, RotateCcw } from "lucide-react";
import { markReportRepliedAction } from "@/app/admin-actions";

interface Report {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  questionExternalId: string | null;
  comment: string;
  createdAt: string;
  repliedAt: string | null;
}

export function MessagesInboxClient({ initialReports }: { initialReports: Report[] }) {
  const [reports, setReports] = useState(initialReports);
  const [filter, setFilter] = useState<"pending" | "replied" | "all">("pending");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const pendingCount = reports.filter((r) => !r.repliedAt).length;
  const repliedCount = reports.filter((r) => r.repliedAt).length;

  const visibleReports = reports.filter((r) => {
    if (filter === "pending") return !r.repliedAt;
    if (filter === "replied") return !!r.repliedAt;
    return true;
  });

  async function toggleReplied(id: string, currentlyReplied: boolean) {
    setUpdatingId(id);
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, repliedAt: currentlyReplied ? null : new Date().toISOString() } : r)));
    const res = await markReportRepliedAction(id, !currentlyReplied);
    if (res.error) {
      setReports((prev) => prev.map((r) => (r.id === id ? { ...r, repliedAt: currentlyReplied ? new Date().toISOString() : null } : r)));
    }
    setUpdatingId(null);
  }

  return (
    <div className="mt-6">
      <div className="flex gap-2">
        <FilterTab label={`Pending (${pendingCount})`} active={filter === "pending"} onClick={() => setFilter("pending")} />
        <FilterTab label={`Replied (${repliedCount})`} active={filter === "replied"} onClick={() => setFilter("replied")} />
        <FilterTab label={`All (${reports.length})`} active={filter === "all"} onClick={() => setFilter("all")} />
      </div>

      {visibleReports.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-[#F0E6D6] bg-white p-8 text-center dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-sm text-[#6B5D4F] dark:text-neutral-400">
            {filter === "pending" ? "Nothing pending — you're all caught up." : "Nothing here yet."}
          </p>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {visibleReports.map((r) => (
            <div key={r.id} className={`rounded-2xl border p-5 ${r.repliedAt ? "border-[#F0E6D6] bg-white/60 dark:border-neutral-800 dark:bg-neutral-900/60" : "border-[#F0E6D6] bg-white dark:border-neutral-800 dark:bg-neutral-900"}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#2B2118] dark:text-neutral-100">{r.name}</span>
                    <span className="text-xs text-[#6B5D4F] dark:text-neutral-500">{r.email}</span>
                    {r.phone && <span className="text-xs text-[#6B5D4F] dark:text-neutral-500">· {r.phone}</span>}
                  </div>
                  {r.questionExternalId && (
                    <span className="mt-1 inline-block rounded-full bg-[#ECE8FA] px-2 py-0.5 text-[10px] font-semibold text-[#4C3AA0] dark:bg-indigo-950/40 dark:text-indigo-300">
                      Re: {r.questionExternalId}
                    </span>
                  )}
                </div>
                <span className="shrink-0 text-xs text-[#6B5D4F] dark:text-neutral-500">
                  {new Date(r.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>

              <p className="mt-3 whitespace-pre-wrap text-sm text-[#2B2118] dark:text-neutral-300">{r.comment}</p>

              <div className="mt-4 flex items-center gap-2">
                <a
                  href={`mailto:${r.email}?subject=${encodeURIComponent("Re: Your message to Qublem")}`}
                  className="flex items-center gap-1.5 rounded-lg bg-[#FF6B4A] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#D9502F]"
                >
                  <Mail size={13} /> Reply via Email
                </a>
                <button
                  onClick={() => toggleReplied(r.id, !!r.repliedAt)}
                  disabled={updatingId === r.id}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 ${
                    r.repliedAt
                      ? "bg-[#F0E6D6] text-[#6B5D4F] hover:bg-[#E5D9C5] dark:bg-neutral-800 dark:text-neutral-400"
                      : "bg-[#E6F7E0] text-[#2E6B1B] hover:bg-[#D5EFC8] dark:bg-emerald-950/40 dark:text-emerald-300"
                  }`}
                >
                  {r.repliedAt ? (
                    <>
                      <RotateCcw size={13} /> Mark as Pending
                    </>
                  ) : (
                    <>
                      <Check size={13} /> Mark as Replied
                    </>
                  )}
                </button>
                {r.repliedAt && (
                  <span className="text-[11px] text-[#6B5D4F] dark:text-neutral-500">
                    Replied {new Date(r.repliedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
        active ? "bg-[#4C3AA0] text-white" : "bg-[#F0E6D6] text-[#6B5D4F] hover:bg-[#E5D9C5] dark:bg-neutral-800 dark:text-neutral-400"
      }`}
    >
      {label}
    </button>
  );
}