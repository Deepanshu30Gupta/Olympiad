"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Check, RotateCcw, Copy, ExternalLink } from "lucide-react";
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

function buildReplyMailto(r: Report): string {
  const subject = `Re: ${r.questionExternalId ? `Question ${r.questionExternalId}` : "Your message to Qublem"}`;
  const MAX_QUOTE_LENGTH = 600;
  const truncatedComment = r.comment.length > MAX_QUOTE_LENGTH ? r.comment.slice(0, MAX_QUOTE_LENGTH) + "... (truncated)" : r.comment;
  const quoted = truncatedComment
    .split("\n")
    .map((line) => `> ${line}`)
    .join("\n");
  const body = `Hi ${r.name},\n\n\n\n---\nYour original message:\n${quoted}`;
  return `mailto:${r.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

type TypeFilter = "questions" | "contact" | "all";
type StatusFilter = "pending" | "replied" | "all";

export function MessagesInboxClient({ initialReports }: { initialReports: Report[] }) {
  const [reports, setReports] = useState(initialReports);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("questions");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const questionReports = reports.filter((r) => r.questionExternalId);
  const contactReports = reports.filter((r) => !r.questionExternalId);

  const typeFiltered = typeFilter === "questions" ? questionReports : typeFilter === "contact" ? contactReports : reports;
  const visibleReports = typeFiltered.filter((r) => {
    if (statusFilter === "pending") return !r.repliedAt;
    if (statusFilter === "replied") return !!r.repliedAt;
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
        <FilterTab label={`Question Reports (${questionReports.length})`} active={typeFilter === "questions"} onClick={() => setTypeFilter("questions")} />
        <FilterTab label={`Contact Messages (${contactReports.length})`} active={typeFilter === "contact"} onClick={() => setTypeFilter("contact")} />
        <FilterTab label={`All (${reports.length})`} active={typeFilter === "all"} onClick={() => setTypeFilter("all")} />
      </div>

      <div className="mt-2 flex gap-2">
        <FilterTab small label={`Pending (${typeFiltered.filter((r) => !r.repliedAt).length})`} active={statusFilter === "pending"} onClick={() => setStatusFilter("pending")} />
        <FilterTab small label={`Replied (${typeFiltered.filter((r) => !!r.repliedAt).length})`} active={statusFilter === "replied"} onClick={() => setStatusFilter("replied")} />
        <FilterTab small label={`All (${typeFiltered.length})`} active={statusFilter === "all"} onClick={() => setStatusFilter("all")} />
      </div>

      {visibleReports.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-[#F0E6D6] bg-white p-8 text-center dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-sm text-[#6B5D4F] dark:text-neutral-400">
            {statusFilter === "pending" ? "Nothing pending — you're all caught up." : "Nothing here yet."}
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
                    <Link
                      href={`/admin/question/${encodeURIComponent(r.questionExternalId)}`}
                      className="mt-1 inline-flex items-center gap-1 rounded-full bg-[#ECE8FA] px-2 py-0.5 text-[10px] font-semibold text-[#4C3AA0] transition-colors hover:bg-[#DDD6F3] dark:bg-indigo-950/40 dark:text-indigo-300"
                    >
                      Re: {r.questionExternalId} <ExternalLink size={10} />
                    </Link>
                  )}
                </div>
                <span className="shrink-0 text-xs text-[#6B5D4F] dark:text-neutral-500">
                  {new Date(r.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>

              <p className="mt-3 whitespace-pre-wrap text-sm text-[#2B2118] dark:text-neutral-300">{r.comment}</p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <a
                  href={buildReplyMailto(r)}
                  className="flex items-center gap-1.5 rounded-lg bg-[#FF6B4A] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#D9502F]"
                >
                  <Mail size={13} /> Reply via Email
                </a>
                <CopyEmailButton email={r.email} />
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

function CopyEmailButton({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fail silently — non-critical convenience action
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 rounded-lg border border-[#F0E6D6] px-3 py-1.5 text-xs font-semibold text-[#6B5D4F] transition-colors hover:border-[#FF6B4A]/50 hover:text-[#2B2118] dark:border-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? "Copied!" : "Copy Email"}
    </button>
  );
}

function FilterTab({ label, active, onClick, small = false }: { label: string; active: boolean; onClick: () => void; small?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full font-semibold transition-colors ${small ? "px-3 py-1 text-[11px]" : "px-4 py-1.5 text-xs"} ${
        active ? "bg-[#4C3AA0] text-white" : "bg-[#F0E6D6] text-[#6B5D4F] hover:bg-[#E5D9C5] dark:bg-neutral-800 dark:text-neutral-400"
      }`}
    >
      {label}
    </button>
  );
}