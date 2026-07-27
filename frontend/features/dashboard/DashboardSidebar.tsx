"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  TrendingUp,
  PieChart,
  BookMarked,
  History,
  Bookmark,
  Trophy,
  FileText,
  Star,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Overview", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Performance", icon: TrendingUp, href: "#" },
  { label: "Analytics", icon: PieChart, href: "#" },
  { label: "Topics", icon: BookMarked, href: "#" },
  { label: "Question History", icon: History, href: "#" },
  { label: "Bookmarks", icon: Bookmark, href: "#" },
  { label: "Achievements", icon: Trophy, href: "#" },
  { label: "Exams", icon: FileText, href: "/onboarding" },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col justify-between border-r border-[#F0E6D6] bg-white px-4 py-6 dark:border-neutral-800 dark:bg-neutral-900 lg:flex">
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-[#FFE8E0] text-[#FF6B4A] dark:bg-[#FF6B4A]/15"
                  : "text-[#6B5D4F] hover:bg-[#FFFBF2] hover:text-[#2B2118] dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="rounded-2xl bg-[#ECE8FA] p-5 text-center dark:bg-indigo-950/30">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#4C3AA0]">
          <Star size={18} className="text-white" />
        </div>
        <h3 className="mt-3 text-sm font-bold text-[#2B2118] dark:text-neutral-100">Qublem Pro</h3>
        <p className="mt-1.5 text-xs text-[#6B5D4F] dark:text-neutral-400">
          Unlock full analytics, advanced filters and personalized insights.
        </p>
        <Link
          href="/contact"
          className="mt-4 block rounded-lg bg-[#4C3AA0] px-3 py-2 text-xs font-semibold text-white hover:bg-[#3D2F82]"
        >
          Get Notified
        </Link>
      </div>
    </aside>
  );
}