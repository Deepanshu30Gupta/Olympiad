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
      // ignore
    }
  }

  if (!mounted) return <div className="h-8 w-[68px]" />;

  return (
    <button
      onClick={toggle}
      aria-label="Toggle light/dark mode"
      aria-pressed={isDark}
      className={`group relative flex h-8 w-[68px] items-center rounded-full px-1.5 shadow-[0_2px_8px_rgba(76,58,160,0.15)] transition-all duration-300 ease-out hover:shadow-[0_3px_12px_rgba(76,58,160,0.25)] active:scale-[0.96] ${
        isDark ? "bg-[#4C3AA0]" : "bg-[#FFF3E0]"
      }`}
    >
      <span className="pointer-events-none absolute left-2 text-xs opacity-70">☀️</span>
      <span className="pointer-events-none absolute right-2 text-xs opacity-70">🌙</span>

      <span
        className={`z-10 flex h-6 w-6 items-center justify-center rounded-full shadow-[0_2px_5px_rgba(0,0,0,0.2)] transition-all duration-300 ease-out group-hover:scale-105 ${
          isDark ? "translate-x-[36px] bg-[#2E1F6B]" : "translate-x-0 bg-[#FF6B4A]"
        }`}
      />
    </button>
  );
}