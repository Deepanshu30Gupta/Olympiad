"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, TrendingUp, BookMarked, ListChecks, Bookmark, Trophy, Menu } from "lucide-react";

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

  return (
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
  );
}