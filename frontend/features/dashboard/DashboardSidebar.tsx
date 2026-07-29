"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, TrendingUp, BookMarked, ListChecks, Bookmark, Trophy, Menu, X } from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", icon: Home, href: "/dashboard" },
  { label: "Progress", icon: TrendingUp, href: "/progress" },
  { label: "Topics", icon: BookMarked, href: "/topics" },
  { label: "Sessions", icon: ListChecks, href: "/sessions" },
  { label: "Bookmarks", icon: Bookmark, href: "/bookmarks" },
  { label: "Leaderboard", icon: Trophy, href: "/leaderboard" },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const drawerRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved === "true") setCollapsed(true);
  }, []);

  function toggle() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("sidebar-collapsed", String(next));
  }

  // Close the mobile drawer on route change.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    if (mobileOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [mobileOpen]);

  // Close on Escape and outside click.
  useEffect(() => {
    if (!mobileOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMobileOpen(false);
        triggerRef.current?.focus();
      }
    }

    function handleClickOutside(e: MouseEvent) {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mobileOpen]);

  return (
    <>
      {/* Mobile trigger — hidden on desktop */}
      <button
        ref={triggerRef}
        onClick={() => setMobileOpen(true)}
        aria-label="Open sidebar menu"
        aria-expanded={mobileOpen}
        aria-controls="mobile-sidebar"
        className="fixed left-4 top-[76px] z-40 flex h-10 w-10 items-center justify-center rounded-xl border border-[#F0E6D6] bg-white text-[#6B5D4F] shadow-md transition-colors hover:bg-[#FFFBF2] hover:text-[#2B2118] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B4A] dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 lg:hidden"
      >
        <Menu size={20} />
      </button>

      {/* Mobile backdrop */}
      <div
        aria-hidden="true"
        onClick={() => setMobileOpen(false)}
        className={`fixed inset-0 z-[45] bg-black/40 transition-opacity duration-300 lg:hidden ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Mobile slide-in drawer */}
      <aside
        id="mobile-sidebar"
        ref={drawerRef}
        aria-label="Sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[#F0E6D6] bg-white px-4 py-6 shadow-xl transition-transform duration-300 ease-in-out dark:border-neutral-800 dark:bg-neutral-900 lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          aria-label="Close sidebar menu"
          className="mb-4 flex h-9 w-9 items-center justify-center self-end rounded-lg text-[#6B5D4F] transition-colors hover:bg-[#FFFBF2] hover:text-[#2B2118] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B4A] dark:text-neutral-400 dark:hover:bg-neutral-800"
        >
          <X size={20} />
        </button>

        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="group relative"
              >
                {active && mounted && (
                  <motion.div
                    layoutId="sidebar-active-mobile"
                    className="absolute inset-0 rounded-xl bg-[#FFE8E0] dark:bg-[#FF6B4A]/15"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <div
                  className={`relative z-10 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "text-[#FF6B4A]"
                      : "text-[#6B5D4F] hover:bg-[#FFFBF2] hover:text-[#2B2118] dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
                  }`}
                >
                  <item.icon size={18} className="shrink-0 transition-transform duration-200 group-hover:scale-110" />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Desktop sidebar — unchanged */}
      <aside
        className={`hidden shrink-0 flex-col border-r border-[#F0E6D6] bg-white py-6 transition-all duration-200 dark:border-neutral-800 dark:bg-neutral-900 lg:flex ${
          collapsed ? "w-[72px] px-2" : "w-60 px-4"
        }`}
      >
        <button
          onClick={toggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg text-[#6B5D4F] transition-colors hover:bg-[#FFFBF2] hover:text-[#2B2118] dark:text-neutral-400 dark:hover:bg-neutral-800"
        >
          <Menu size={20} />
        </button>

        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.label} href={item.href} className="group relative" title={collapsed ? item.label : undefined}>
                {active && mounted && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-xl bg-[#FFE8E0] dark:bg-[#FF6B4A]/15"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <div
                  className={`relative z-10 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "text-[#FF6B4A]"
                      : "text-[#6B5D4F] hover:bg-[#FFFBF2] hover:text-[#2B2118] dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
                  } ${collapsed ? "justify-center" : ""}`}
                >
                  <item.icon size={18} className="shrink-0 transition-transform duration-200 group-hover:scale-110" />
                  {!collapsed && item.label}
                </div>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}