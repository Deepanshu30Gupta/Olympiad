"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useUser } from "@clerk/nextjs";
import { submitReportAction } from "@/app/actions";
import { Spinner } from "@/components/ui/Spinner";

interface ReportWidgetProps {
  questionId?: string;
  questionExternalId?: string;
  triggerLabel?: string;
  triggerClassName?: string;
}

export function ReportWidget({
  questionId,
  questionExternalId,
  triggerLabel = "Report an issue",
  triggerClassName,
}: ReportWidgetProps) {
  const { user, isSignedIn } = useUser();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  // Auto-fill from the signed-in user — question reports always come
  // from a signed-in student, so this should populate reliably every
  // time, no manual retyping needed.
  useEffect(() => {
    if (isSignedIn && user) {
      if (user.fullName) setName(user.fullName);
      if (user.primaryEmailAddress?.emailAddress) setEmail(user.primaryEmailAddress.emailAddress);
      if (user.primaryPhoneNumber?.phoneNumber) setPhone(user.primaryPhoneNumber.phoneNumber);
    }
  }, [isSignedIn, user]);

  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !submitting) resetAndClose();
    }
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, submitting]);

  function resetAndClose() {
    if (submitting) return;
    setOpen(false);
    setTimeout(() => {
      setSubmitted(false);
      setComment("");
      setError(null);
    }, 200);
  }

  async function handleSubmit() {
    if (!name.trim() || !email.trim() || !comment.trim() || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await submitReportAction({
        name,
        email,
        phone: phone || null,
        questionId: questionId ?? null,
        questionExternalId: questionExternalId ?? null,
        comment,
      });
      if (res.error) {
        setError(res.error);
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const modal = (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm transition-opacity duration-200 ${
        open ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      onClick={resetAndClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-200 dark:bg-neutral-900 ${
          open ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        {submitted ? (
          <div className="p-6">
            <h2 className="text-lg font-semibold text-[#2B2118] dark:text-neutral-100" style={{ fontFamily: "var(--font-fredoka, inherit)" }}>
              Thanks — got it.
            </h2>
            <p className="mt-2 text-sm text-[#6B5D4F] dark:text-neutral-400">
              We&rsquo;ll take a look. Appreciate you flagging it.
            </p>
            <button onClick={resetAndClose} className="mt-5 rounded-lg bg-[#FF6B4A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#D9502F]">
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="shrink-0 px-6 pt-6">
              <h2 className="text-lg font-semibold text-[#2B2118] dark:text-neutral-100" style={{ fontFamily: "var(--font-fredoka, inherit)" }}>
                {questionExternalId ? "Report an issue with this question" : "Report an issue or share feedback"}
              </h2>
              {questionExternalId && (
                <p className="mt-1 text-xs text-[#6B5D4F] dark:text-neutral-500">
                  Question: <span className="font-mono">{questionExternalId}</span>
                </p>
              )}
              {error && (
                <div className="mt-3 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
                  {error}
                </div>
              )}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-xs font-medium text-[#6B5D4F] dark:text-neutral-400">Name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-lg border border-[#F0E6D6] px-3 py-2 text-sm outline-none focus:border-[#FF6B4A] dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100" />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#6B5D4F] dark:text-neutral-400">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-lg border border-[#F0E6D6] px-3 py-2 text-sm outline-none focus:border-[#FF6B4A] dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100" />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#6B5D4F] dark:text-neutral-400">Phone (optional)</label>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 w-full rounded-lg border border-[#F0E6D6] px-3 py-2 text-sm outline-none focus:border-[#FF6B4A] dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100" />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#6B5D4F] dark:text-neutral-400">
                    {questionExternalId ? "What's the issue?" : "What's on your mind?"}
                  </label>
                  <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={4} className="mt-1 w-full rounded-lg border border-[#F0E6D6] px-3 py-2 text-sm outline-none focus:border-[#FF6B4A] dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100" />
                </div>
              </div>
            </div>

            <div className="flex shrink-0 justify-end gap-3 border-t border-[#F0E6D6] px-6 py-4 dark:border-neutral-800">
              <button onClick={resetAndClose} disabled={submitting} className="rounded-lg px-4 py-2 text-sm font-medium text-[#6B5D4F] hover:bg-[#F0E6D6] disabled:opacity-50 dark:text-neutral-400 dark:hover:bg-neutral-800">
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={!name.trim() || !email.trim() || !comment.trim() || submitting} className="flex items-center gap-2 rounded-lg bg-[#FF6B4A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#D9502F] disabled:opacity-50">
                {submitting && <Spinner />}
                Submit
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={triggerClassName ?? "text-xs font-medium text-neutral-500 underline decoration-dotted transition-colors hover:text-neutral-300"}
      >
        {triggerLabel}
      </button>

      {mounted && (open || submitted) && createPortal(modal, document.body)}
    </>
  );
}