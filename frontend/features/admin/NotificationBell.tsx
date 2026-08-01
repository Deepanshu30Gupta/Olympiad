"use client";

import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { getMyNotificationsAction, markNotificationReadAction } from "@/app/admin-actions";

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getMyNotificationsAction().then((res) => {
      setNotifications(res.notifications);
      setUnreadCount(res.unreadCount);
    });
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleOpen(id: string, read: boolean) {
    if (!read) {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
      await markNotificationReadAction(id);
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        aria-label="Notifications"
        className="group relative flex h-9 w-9 items-center justify-center rounded-full text-[#6B5D4F] transition-all duration-200 hover:scale-110 hover:bg-[#F0E6D6] hover:text-[#2B2118] dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
      >
        <Bell size={23} strokeWidth={2.3} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FF6B4A] px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-80 max-h-96 overflow-y-auto rounded-2xl border border-[#F0E6D6] bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
          <div className="border-b border-[#F0E6D6] px-4 py-3 dark:border-neutral-800">
            <h3 className="text-sm font-bold text-[#2B2118] dark:text-neutral-100">Notifications</h3>
          </div>
          {notifications.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-[#6B5D4F] dark:text-neutral-500">Nothing yet.</p>
          ) : (
            <div className="flex flex-col">
              {notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleOpen(n.id, n.read)}
                  className={`border-b border-[#F0E6D6] px-4 py-3 text-left transition-colors last:border-0 hover:bg-[#FFFBF2] dark:border-neutral-800 dark:hover:bg-neutral-800 ${!n.read ? "bg-[#FFF3E0] dark:bg-neutral-800/60" : ""}`}
                >
                  <div className="flex items-center gap-2">
                    {!n.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#FF6B4A]" />}
                    <span className="text-sm font-semibold text-[#2B2118] dark:text-neutral-100">{n.title}</span>
                  </div>
                  <p className="mt-1 text-xs text-[#6B5D4F] dark:text-neutral-400">{n.body}</p>
                  <p className="mt-1 text-[10px] text-[#8A7C6C] dark:text-neutral-600">
                    {new Date(n.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}