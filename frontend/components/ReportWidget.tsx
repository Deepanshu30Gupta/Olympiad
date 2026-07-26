"use client";

import { useState } from "react";
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
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function resetAndClose() {
    setOpen(false);
    setSubmitted(false);
    setName("");
    setEmail("");
    setPhone("");
    setComment("");
    setError(null);
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

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={
          triggerClassName ??
          "text-xs font-medium text-neutral-500 underline decoration-dotted transition-colors hover:text-neutral-300"
        }
      >
        {triggerLabel}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={resetAndClose}
        >
          <div
            className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 text-[#2B2118] shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {submitted ? (
              <div>
                <h2 className="text-lg font-semibold" style={{ fontFamily: "var(--font-fredoka, inherit)" }}>
                  Thanks — got it.
                </h2>
                <p className="mt-2 text-sm text-[#6B5D4F]">
                  We'll take a look. Appreciate you flagging it.
                </p>
                <button
                  onClick={resetAndClose}
                  className="mt-5 rounded-lg bg-[#FF6B4A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#D9502F]"
                >
                  Close
                </button>
              </div>
            ) : (
              <div>
                <h2 className="text-lg font-semibold" style={{ fontFamily: "var(--font-fredoka, inherit)" }}>
                  {questionExternalId ? "Report an issue with this question" : "Report an issue or share feedback"}
                </h2>
                {questionExternalId && (
                  <p className="mt-1 text-xs text-[#6B5D4F]">
                    Question: <span className="font-mono">{questionExternalId}</span>
                  </p>
                )}

                {error && (
                  <div className="mt-3 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div className="mt-4 flex flex-col gap-3">
                  <div>
                    <label className="text-xs font-medium text-[#6B5D4F]">Name</label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-[#F0E6D6] px-3 py-2 text-sm outline-none focus:border-[#FF6B4A]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#6B5D4F]">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-[#F0E6D6] px-3 py-2 text-sm outline-none focus:border-[#FF6B4A]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#6B5D4F]">Phone (optional)</label>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-[#F0E6D6] px-3 py-2 text-sm outline-none focus:border-[#FF6B4A]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#6B5D4F]">
                      {questionExternalId ? "What's the issue?" : "What's on your mind?"}
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={4}
                      className="mt-1 w-full rounded-lg border border-[#F0E6D6] px-3 py-2 text-sm outline-none focus:border-[#FF6B4A]"
                    />
                  </div>
                </div>

                <div className="mt-5 flex justify-end gap-3">
                  <button
                    onClick={resetAndClose}
                    className="rounded-lg px-4 py-2 text-sm font-medium text-[#6B5D4F] hover:bg-[#F0E6D6]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!name.trim() || !email.trim() || !comment.trim() || submitting}
                    className="flex items-center gap-2 rounded-lg bg-[#FF6B4A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#D9502F] disabled:opacity-50"
                  >
                    {submitting && <Spinner />}
                    Submit
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}