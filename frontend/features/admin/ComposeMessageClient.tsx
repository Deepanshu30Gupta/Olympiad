"use client";

import { useState } from "react";
import { Search, X, Send } from "lucide-react";
import { searchUsersAction, sendNotificationAction } from "@/app/admin-actions";

interface UserOption {
  id: string;
  name: string | null;
  email: string;
}

export function ComposeMessageClient() {
  const [mode, setMode] = useState<"all" | "selected">("selected");
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserOption[]>([]);
  const [selected, setSelected] = useState<UserOption[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [alsoEmail, setAlsoEmail] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ error: string | null; emailStatus: string; recipientCount: number } | null>(null);

  async function handleSearch(value: string) {
    setQuery(value);
    if (value.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const results = await searchUsersAction(value);
    setSearchResults(results.filter((r) => !selected.some((s) => s.id === r.id)));
  }

  function addUser(u: UserOption) {
    setSelected((prev) => [...prev, u]);
    setSearchResults((prev) => prev.filter((r) => r.id !== u.id));
  }

  function removeUser(id: string) {
    setSelected((prev) => prev.filter((u) => u.id !== id));
  }

  async function handleSend() {
    if (!title.trim() || !body.trim() || sending) return;
    if (mode === "selected" && selected.length === 0) return;
    setSending(true);
    setResult(null);
    const res = await sendNotificationAction({
      title,
      body,
      recipientUserIds: selected.map((u) => u.id),
      sendToAll: mode === "all",
      alsoEmail,
    });
    setResult(res);
    setSending(false);
    if (!res.error) {
      setTitle("");
      setBody("");
      setSelected([]);
    }
  }

  return (
    <div className="mt-6 rounded-3xl border border-[#F0E6D6] bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex gap-2">
        <button
          onClick={() => setMode("selected")}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${mode === "selected" ? "bg-[#4C3AA0] text-white" : "bg-[#F0E6D6] text-[#6B5D4F] dark:bg-neutral-800 dark:text-neutral-400"}`}
        >
          Selected Users
        </button>
        <button
          onClick={() => setMode("all")}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${mode === "all" ? "bg-[#4C3AA0] text-white" : "bg-[#F0E6D6] text-[#6B5D4F] dark:bg-neutral-800 dark:text-neutral-400"}`}
        >
          All Users
        </button>
      </div>

      {mode === "selected" && (
        <div className="mt-4">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B5D4F] dark:text-neutral-500" />
            <input
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full rounded-lg border border-[#F0E6D6] py-2 pl-9 pr-3 text-sm outline-none focus:border-[#4C3AA0] dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            />
          </div>
          {searchResults.length > 0 && (
            <div className="mt-1 flex flex-col gap-1 rounded-lg border border-[#F0E6D6] bg-white p-1 dark:border-neutral-700 dark:bg-neutral-800">
              {searchResults.map((u) => (
                <button
                  key={u.id}
                  onClick={() => addUser(u)}
                  className="flex items-center justify-between rounded px-2 py-1.5 text-left text-sm hover:bg-[#FFFBF2] dark:hover:bg-neutral-700"
                >
                  <span className="text-[#2B2118] dark:text-neutral-200">{u.name ?? u.email}</span>
                  <span className="text-xs text-[#6B5D4F] dark:text-neutral-500">{u.email}</span>
                </button>
              ))}
            </div>
          )}
          {selected.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {selected.map((u) => (
                <span key={u.id} className="flex items-center gap-1 rounded-full bg-[#ECE8FA] px-2.5 py-1 text-xs font-medium text-[#4C3AA0] dark:bg-indigo-950/40 dark:text-indigo-300">
                  {u.name ?? u.email}
                  <button onClick={() => removeUser(u.id)}>
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        className="mt-4 w-full rounded-lg border border-[#F0E6D6] px-4 py-2.5 text-sm outline-none focus:border-[#4C3AA0] dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Message"
        rows={5}
        className="mt-3 w-full resize-y rounded-lg border border-[#F0E6D6] px-4 py-2.5 text-sm outline-none focus:border-[#4C3AA0] dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
      />

      <label className="mt-3 flex items-center gap-2 text-sm text-[#6B5D4F] dark:text-neutral-400">
        <input type="checkbox" checked={alsoEmail} onChange={(e) => setAlsoEmail(e.target.checked)} className="rounded" />
        Also send via email
      </label>

      {result && (
        <div className={`mt-3 rounded-lg px-3 py-2 text-xs ${result.error ? "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300" : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"}`}>
          {result.error ? (
            result.error
          ) : (
            <>
              Sent to {result.recipientCount} user{result.recipientCount !== 1 ? "s" : ""}.
              {result.emailStatus === "sent" && " Email sent too."}
              {result.emailStatus === "not_configured" && " Email skipped — RESEND_API_KEY isn't set up yet."}
              {result.emailStatus === "failed" && " Notification sent, but the email failed to send."}
            </>
          )}
        </div>
      )}

      <button
        onClick={handleSend}
        disabled={sending || !title.trim() || !body.trim() || (mode === "selected" && selected.length === 0)}
        className="mt-4 flex items-center gap-2 rounded-xl bg-[#FF6B4A] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#D9502F] disabled:opacity-50"
      >
        <Send size={15} /> {sending ? "Sending..." : "Send"}
      </button>
    </div>
  );
}