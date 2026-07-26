"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // localStorage can throw in some privacy modes — not worth failing over.
    }
  }

  // Same-sized placeholder until mounted, so nothing pops in after hydration.
  if (!mounted) return <div className="h-7 w-14" />;

  return (
    <button
      onClick={toggle}
      aria-label="Toggle light/dark mode"
      aria-pressed={isDark}
      className={`relative flex h-7 w-14 items-center rounded-full px-1 transition-colors duration-300 ${
        isDark ? "bg-[#4C3AA0]" : "bg-[#F0E6D6]"
      }`}
    >
      {/* Track icons — sit fixed in place, the thumb slides over/past them */}
      <span className="pointer-events-none absolute left-1.5 text-[11px]">☀️</span>
      <span className="pointer-events-none absolute right-1.5 text-[11px]">🌙</span>

      {/* The sliding thumb — plain circle, track icons underneath show which mode is active */}
      <span
        className={`z-10 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-300 ${
          isDark ? "translate-x-7" : "translate-x-0"
        }`}
      />
    </button>
  );
}