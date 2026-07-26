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
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  // Avoid a hydration mismatch — render nothing until we know the real
  // state from the DOM (which the inline script in layout.tsx already
  // set before hydration, see the FOUC-prevention note there).
  if (!mounted) return <div className="h-8 w-8" />;

  return (
    <button
      onClick={toggle}
      aria-label="Toggle light and dark mode"
      className="flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-colors hover:bg-neutral-800"
    >
      {isDark ? "☀️" : "🌙"}
    </button>
  );
}