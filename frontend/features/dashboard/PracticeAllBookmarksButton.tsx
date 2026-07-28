"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlayCircle } from "lucide-react";
import { startAllBookmarksAction } from "@/app/practice/actions";
import { Spinner } from "@/components/ui/Spinner";

export function PracticeAllBookmarksButton() {
  const router = useRouter();
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (starting) return;
    setStarting(true);
    setError(null);
    try {
      const res = await startAllBookmarksAction();
      if (res.sessionId) {
        router.push(`/practice?sessionId=${res.sessionId}&returnTo=%2Fbookmarks`);
      } else {
        setError(res.error ?? "Something went wrong.");
        setStarting(false);
      }
    } catch {
      setError("Couldn't reach the server.");
      setStarting(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={starting}
        className="flex items-center gap-2 rounded-xl bg-[#4C3AA0] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#3D2F82] disabled:opacity-60"
      >
        {starting ? <Spinner /> : <PlayCircle size={16} />}
        {starting ? "Starting..." : "Practice All Bookmarks"}
      </button>
      {error && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}