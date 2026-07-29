"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { submitReportAction } from "@/app/actions";
import { Spinner } from "@/components/ui/Spinner";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!name.trim() || !email.trim() || !message.trim() || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const combinedComment = subject.trim() ? `Subject: ${subject.trim()}\n\n${message.trim()}` : message.trim();
      const res = await submitReportAction({
        name,
        email,
        phone: null,
        questionId: null,
        questionExternalId: null,
        comment: combinedComment,
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

  if (submitted) {
    return (
      <div className="flex h-full flex-col items-center justify-center py-16 text-center">
        <h3 className="text-xl font-bold text-[#2B2118] dark:text-neutral-100" style={{ fontFamily: "var(--font-fredoka), sans-serif" }}>
          Message sent! 🎉
        </h3>
        <p className="mt-2 text-sm text-[#6B5D4F] dark:text-neutral-400">
          Thanks for reaching out — we&rsquo;ll get back to you soon.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-[#2B2118] dark:text-neutral-100" style={{ fontFamily: "var(--font-fredoka), sans-serif" }}>
        Send us a message
      </h2>

      {error && (
        <div className="mt-3 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your Name"
          className="rounded-xl border border-[#F0E6D6] bg-[#FFFBF2] px-4 py-3 text-sm text-[#2B2118] outline-none focus:border-[#FF6B4A] dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email Address"
          className="rounded-xl border border-[#F0E6D6] bg-[#FFFBF2] px-4 py-3 text-sm text-[#2B2118] outline-none focus:border-[#FF6B4A] dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
        />
      </div>

      <input
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        placeholder="Subject"
        className="mt-4 w-full rounded-xl border border-[#F0E6D6] bg-[#FFFBF2] px-4 py-3 text-sm text-[#2B2118] outline-none focus:border-[#FF6B4A] dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
      />

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Your Message"
        rows={6}
        className="mt-4 w-full resize-y rounded-xl border border-[#F0E6D6] bg-[#FFFBF2] px-4 py-3 text-sm text-[#2B2118] outline-none focus:border-[#FF6B4A] dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
      />

      <button
        onClick={handleSubmit}
        disabled={!name.trim() || !email.trim() || !message.trim() || submitting}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF6B4A] px-4 py-3.5 text-sm font-bold text-white transition-all hover:bg-[#D9502F] disabled:opacity-50"
      >
        {submitting ? <Spinner /> : <Send size={16} />}
        {submitting ? "Sending..." : "Send Message"}
      </button>
    </div>
  );
}