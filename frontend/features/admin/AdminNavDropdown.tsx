"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Shield, ChevronDown, Inbox, BookOpen, Send } from "lucide-react";
import { isCurrentUserAdminAction } from "@/app/admin-actions";

const ADMIN_LINKS = [
  { label: "Messages", href: "/admin/messages", icon: Inbox },
  { label: "Question Library", href: "/admin/library", icon: BookOpen },
  { label: "Send a Message", href: "/admin/compose", icon: Send },
];

export function AdminNavDropdown() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    isCurrentUserAdminAction().then(setIsAdmin);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isAdmin) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 whitespace-nowrap text-sm font-medium text-[#4C3AA0] transition-colors hover:text-[#3D2F82] dark:text-indigo-400 dark:hover:text-indigo-300"
      >
        <Shield size={15} /> Admin <ChevronDown size={13} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-8 z-50 w-52 rounded-xl border border-[#F0E6D6] bg-white py-1.5 shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
          {ADMIN_LINKS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#2B2118] transition-colors hover:bg-[#FFFBF2] dark:text-neutral-200 dark:hover:bg-neutral-800"
            >
              <item.icon size={16} className="text-[#6B5D4F] dark:text-neutral-500" />
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}