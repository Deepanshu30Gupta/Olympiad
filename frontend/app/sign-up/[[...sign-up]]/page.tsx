"use client";

import { useEffect, useState } from "react";
import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { getClerkAppearance } from "@/lib/clerk-appearance";

export default function SignUpPage() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    setIsDark(html.classList.contains("dark"));

    const observer = new MutationObserver(() => {
      setIsDark(html.classList.contains("dark"));
    });
    observer.observe(html, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center bg-[#FFFBF2] px-4 py-10 dark:bg-neutral-950">
      <Link href="/" className="mb-2 flex items-center gap-2">
        <Image src="/logo.svg" alt="Qublem" width={36} height={36} className="rounded-lg" />
        <span
          className="text-xl font-bold text-[#2B2118] dark:text-neutral-100"
          style={{ fontFamily: "var(--font-fredoka), sans-serif" }}
        >
          Qublem
        </span>
      </Link>
      <p className="mb-7 text-sm text-[#6B5D4F] dark:text-neutral-400">Start training today.</p>

      <SignUp
        forceRedirectUrl="/dashboard"
        appearance={{
          ...getClerkAppearance(isDark),
          elements: {
            card: {
              boxShadow: "none",
              border: isDark ? "1px solid #262626" : "1px solid #F0E6D6",
            },
          },
        }}
      />
    </div>
  );
}