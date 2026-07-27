"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";
import { toggleBookmarkAction } from "@/app/actions";

export function BookmarkButton({ questionId, initiallyBookmarked }: { questionId: string; initiallyBookmarked: boolean }) {
  const [bookmarked, setBookmarked] = useState(initiallyBookmarked);
  const [pending, setPending] = useState(false);

  async function handleClick() {
    if (pending) return;
    setPending(true);
    const prev = bookmarked;
    setBookmarked(!prev);
    try {
      const res = await toggleBookmarkAction(questionId);
      if (res.error || res.bookmarked === null) {
        setBookmarked(prev);
      } else {
        setBookmarked(res.bookmarked);
      }
    } catch {
      setBookmarked(prev);
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      aria-label={bookmarked ? "Remove bookmark" : "Bookmark this question"}
      className="text-[#6B5D4F] transition-colors hover:text-[#FF6B4A] dark:text-neutral-500 dark:hover:text-[#FF6B4A]"
    >
      <Bookmark size={18} fill={bookmarked ? "#FF6B4A" : "none"} color={bookmarked ? "#FF6B4A" : "currentColor"} />
    </button>
  );
}