"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Show, UserButton } from "@clerk/nextjs";
import { NotificationBell } from "@/features/admin/NotificationBell";
import { AdminNavDropdown } from "@/features/admin/AdminNavDropdown";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Practice", href: "/onboarding" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "About", href: "/story" },
  { label: "Contact Us", href: "/contact" },
];

export function Header() {
  const pathname = usePathname();

  function handleHomeClick(e: React.MouseEvent, href: string) {
    if (href === "/" && pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <header className="sticky top-0 z-40 grid h-16 grid-cols-[1fr_auto_1fr] items-center border-b border-[#F0E6D6] bg-[#FFFBF2]/90 px-6 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-950/90">
      <Link href="/" className="flex w-fit items-center gap-2.5">
        <Image src="/logo.svg" alt="Qublem" width={32} height={32} className="rounded-lg" />
        <span className="text-lg font-bold text-[#2B2118] dark:text-neutral-100" style={{ fontFamily: "var(--font-fredoka), sans-serif" }}>
          Qublem
        </span>
      </Link>

      <nav className="hidden items-center gap-10 md:flex">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={(e) => handleHomeClick(e, item.href)}
              className={`relative whitespace-nowrap pb-1 text-sm font-medium transition-colors ${
                active ? "text-[#FF6B4A]" : "text-[#2B2118] hover:text-[#FF6B4A] dark:text-neutral-300 dark:hover:text-[#FF6B4A]"
              }`}
            >
              {item.label}
              {active && <span className="absolute -bottom-[1px] left-0 h-0.5 w-full rounded-full bg-[#FF6B4A]" />}
            </Link>
          );
        })}
        <AdminNavDropdown />
      </nav>

      <div className="flex items-center justify-end gap-4">
        <ThemeToggle />
        <Show when="signed-in">
          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="cursor-pointer rounded-full transition-all duration-200 hover:scale-105 hover:shadow-[0_2px_10px_rgba(76,58,160,0.25)]">
              <UserButton />
            </div>
          </div>
        </Show>
        <Show when="signed-out">
          <Link href="/sign-in" className="rounded-lg bg-[#FF6B4A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#D9502F]">
            Sign in
          </Link>
        </Show>
      </div>
    </header>
  );
}