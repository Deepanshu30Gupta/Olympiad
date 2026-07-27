"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Show, UserButton, SignInButton } from "@clerk/nextjs";
import { Bell } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { ReportWidget } from "@/components/ReportWidget";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Practice", href: "/onboarding" },
  { label: "Leaderboard", href: "/leaderboard" },
  { label: "Dashboard", href: "/dashboard" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[#F0E6D6] bg-[#FFFBF2]/90 px-6 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-950/90">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.svg" alt="Qublem" width={32} height={32} className="rounded-lg" />
          <span
            className="text-lg font-bold text-[#2B2118] dark:text-neutral-100"
            style={{ fontFamily: "var(--font-fredoka), sans-serif" }}
          >
            Qublem
          </span>
        </Link>

        <nav className="hidden items-center gap-12 md:flex">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`relative pb-1 text-sm font-medium transition-colors ${
                  active
                    ? "text-[#FF6B4A]"
                    : "text-[#2B2118] hover:text-[#FF6B4A] dark:text-neutral-300 dark:hover:text-[#FF6B4A]"
                }`}
              >
                {item.label}
                {active && (
                  <span className="absolute -bottom-[1px] left-0 h-0.5 w-full rounded-full bg-[#FF6B4A]" />
                )}
              </Link>
            );
          })}
          <ReportWidget
            triggerLabel="Feedback"
            triggerClassName="text-sm font-medium text-[#2B2118] hover:text-[#FF6B4A] dark:text-neutral-300 dark:hover:text-[#FF6B4A]"
          />
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />
        <Show when="signed-in">
          <div className="flex items-center gap-4">
            {/* Notification bell — visual only, no notifications system exists yet */}
            <button
              aria-label="Notifications"
              className="group relative flex h-9 w-9 items-center justify-center rounded-full text-[#6B5D4F] transition-all duration-200 hover:scale-110 hover:bg-[#F0E6D6] hover:text-[#2B2118] dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
            >
              <Bell size={23} strokeWidth={2.3} />
            </button>
            <div className="cursor-pointer rounded-full transition-all duration-200 hover:scale-105 hover:shadow-[0_2px_10px_rgba(76,58,160,0.25)]">
              <UserButton />
            </div>
          </div>
        </Show>
        <Show when="signed-out">
          <SignInButton>
            <button className="rounded-lg border border-[#F0E6D6] px-4 py-2 text-sm font-semibold text-[#2B2118] hover:border-[#FF6B4A]/50 dark:border-neutral-800 dark:text-neutral-100">
              Sign in
            </button>
          </SignInButton>
          <Link
            href="/sign-up"
            className="rounded-lg bg-[#FF6B4A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#D9502F]"
          >
            Start solving questions
          </Link>
        </Show>
      </div>
    </header>
  );
}