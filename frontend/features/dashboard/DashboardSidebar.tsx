"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, TrendingUp, BookMarked, ListChecks, Settings, Target, Bookmark } from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", icon: Home, href: "/dashboard" },
  { label: "Progress", icon: TrendingUp, href: "/progress" },
  { label: "Topics", icon: BookMarked, href: "/topics" },
  { label: "Sessions", icon: ListChecks, href: "/sessions" },
  { label: "Bookmarks", icon: Bookmark, href: "/bookmarks" },
  { label: "Settings", icon: Settings, href: "#" },
];

export function DashboardSidebar({
  todaysGoal,
}: {
  todaysGoal?: { solvedToday: number; dailyGoal: number; pct: number };
}) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col justify-between border-r border-[#F0E6D6] bg-white px-4 py-6 dark:border-neutral-800 dark:bg-neutral-900 lg:flex">
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.label} href={item.href} className="group relative">
              {active && (
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
                }`}
              >
                <item.icon size={18} className="transition-transform duration-200 group-hover:scale-110" />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      {todaysGoal && (
        <div className="rounded-2xl border border-[#F0E6D6] bg-[#FFFBF2] p-5 dark:border-neutral-800 dark:bg-neutral-800/40">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6FCF52]">
              <Target size={16} className="text-white" />
            </div>
            <h3 className="text-sm font-bold text-[#2B2118] dark:text-neutral-100">Today&rsquo;s Goal</h3>
          </div>
          <p className="mt-2 text-xs text-[#6B5D4F] dark:text-neutral-400">
            {todaysGoal.solvedToday} of {todaysGoal.dailyGoal} solved
          </p>
          <div className="mt-2 h-1.5 rounded-full bg-[#F0E6D6] dark:bg-neutral-700">
            <div className="h-1.5 rounded-full bg-[#6FCF52] transition-all duration-500" style={{ width: `${todaysGoal.pct}%` }} />
          </div>
        </div>
      )}
    </aside>
  );
}