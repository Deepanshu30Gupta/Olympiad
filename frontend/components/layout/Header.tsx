"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Show, UserButton } from "@clerk/nextjs";
import { Bell, Menu, X } from "lucide-react";
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
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Close on click/tap outside the header.
  useEffect(() => {
    if (!menuOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  // Close on Escape and return focus to the toggle button.
  useEffect(() => {
    if (!menuOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  function handleHomeClick(e: React.MouseEvent, href: string) {
    if (href === "/" && pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function handleNavClick(e: React.MouseEvent, href: string) {
    handleHomeClick(e, href);
    setMenuOpen(false);
  }

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[#F0E6D6] bg-[#FFFBF2]/90 px-4 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-950/90 sm:px-6 md:grid md:grid-cols-[1fr_auto_1fr] md:justify-normal"
    >
      <Link href="/" className="flex w-fit shrink-0 items-center gap-2.5">
        <Image src="/logo.svg" alt="Qublem" width={32} height={32} className="rounded-lg" />
        <span
          className="text-lg font-bold text-[#2B2118] dark:text-neutral-100"
          style={{ fontFamily: "var(--font-fredoka), sans-serif" }}
        >
          Qublem
        </span>
      </Link>

      {/* Desktop nav — unchanged */}
      <nav className="hidden items-center gap-10 md:flex">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={(e) => handleHomeClick(e, item.href)}
              className={`relative whitespace-nowrap pb-1 text-sm font-medium transition-colors ${
                active
                  ? "text-[#FF6B4A]"
                  : "text-[#2B2118] hover:text-[#FF6B4A] dark:text-neutral-300 dark:hover:text-[#FF6B4A]"
              }`}
            >
              {item.label}
              {active && <span className="absolute -bottom-[1px] left-0 h-0.5 w-full rounded-full bg-[#FF6B4A]" />}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center justify-end gap-2 sm:gap-3 md:gap-4">
        <ThemeToggle />
        <Show when="signed-in">
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
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
          <Link
            href="/sign-in"
            className="rounded-lg bg-[#FF6B4A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#D9502F]"
          >
            Sign in
          </Link>
        </Show>

        {/* Mobile menu toggle — hidden on desktop */}
        <button
          ref={menuButtonRef}
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav-menu"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="flex h-9 w-9 items-center justify-center rounded-full text-[#6B5D4F] transition-all duration-200 hover:scale-110 hover:bg-[#F0E6D6] hover:text-[#2B2118] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B4A] focus-visible:ring-offset-1 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 md:hidden"
        >
          {menuOpen ? <X size={22} strokeWidth={2.3} /> : <Menu size={22} strokeWidth={2.3} />}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      <div
        id="mobile-nav-menu"
        className={`absolute left-0 right-0 top-16 overflow-hidden px-4 transition-all duration-300 ease-in-out md:hidden ${
          menuOpen
            ? "max-h-96 translate-y-0 opacity-100"
            : "pointer-events-none max-h-0 -translate-y-2 opacity-0"
        }`}
      >
        <nav
          aria-label="Mobile"
          className="mt-2 flex flex-col gap-1 rounded-2xl border border-[#F0E6D6] bg-[#FFFBF2] p-3 shadow-lg shadow-[#2B2118]/10 dark:border-neutral-800 dark:bg-neutral-950 dark:shadow-black/40"
        >
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B4A] ${
                  active
                    ? "bg-[#FFF1EC] text-[#FF6B4A] dark:bg-[#FF6B4A]/10"
                    : "text-[#2B2118] hover:bg-[#F0E6D6] hover:text-[#FF6B4A] dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-[#FF6B4A]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}