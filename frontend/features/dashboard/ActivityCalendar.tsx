"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getCalendarMonthAction } from "@/app/calendar-actions";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

interface DayData {
  date: string;
  total: number;
  solved: number;
}

function colorFor(day: DayData): string {
  if (day.total === 0) return "bg-[#F0E6D6] dark:bg-neutral-800";
  if (day.total <= 2) return "bg-[#C8E6BC] dark:bg-emerald-900";
  if (day.total <= 4) return "bg-[#8FCB77] dark:bg-emerald-700";
  return "bg-[#2E6B1B] dark:bg-emerald-500";
}

export function ActivityCalendar({ joinDate }: { joinDate: string }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [days, setDays] = useState<DayData[]>([]);
  const [firstWeekday, setFirstWeekday] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);

  const join = new Date(joinDate);
  const isLatestMonth = year === today.getFullYear() && month === today.getMonth();
  const canGoBack = year > join.getFullYear() || (year === join.getFullYear() && month > join.getMonth());
  const canGoForward = !isLatestMonth;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setSelectedDay(null);
    getCalendarMonthAction(year, month).then((res) => {
      if (cancelled) return;
      if (res.data) {
        setDays(res.data.days);
        setFirstWeekday(res.data.firstWeekday);
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [year, month]);

  function goPrev() {
    if (!canGoBack) return;
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function goNext() {
    if (!canGoForward) return;
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else {
      setMonth((m) => m + 1);
    }
  }

  const leadingBlanks = Array.from({ length: firstWeekday });
  const totalThisMonth = days.reduce((sum, d) => sum + d.total, 0);
  const activeDaysThisMonth = days.filter((d) => d.total > 0).length;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-[#2B2118] dark:text-neutral-100" style={{ fontFamily: "var(--font-fredoka), sans-serif" }}>
          {MONTH_NAMES[month]} {year}
        </h2>
        <div className="flex items-center gap-1">
          <button onClick={goPrev} disabled={!canGoBack} aria-label="Previous month" className="flex h-7 w-7 items-center justify-center rounded-lg text-[#6B5D4F] transition-colors hover:bg-[#FFFBF2] disabled:opacity-30 dark:text-neutral-400 dark:hover:bg-neutral-800">
            <ChevronLeft size={16} />
          </button>
          <button onClick={goNext} disabled={!canGoForward} aria-label="Next month" className="flex h-7 w-7 items-center justify-center rounded-lg text-[#6B5D4F] transition-colors hover:bg-[#FFFBF2] disabled:opacity-30 dark:text-neutral-400 dark:hover:bg-neutral-800">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className={`mt-4 transition-opacity duration-150 ${loading ? "opacity-40" : "opacity-100"}`}>
        <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] text-[#6B5D4F] dark:text-neutral-500">
          {DAY_LABELS.map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>
        <div className="mt-1.5 grid grid-cols-7 gap-1.5">
          {leadingBlanks.map((_, i) => (
            <div key={`blank-${i}`} />
          ))}
          {days.map((day) => {
            const dayNum = Number(day.date.slice(-2));
            const isSelected = selectedDay?.date === day.date;
            return (
              <button
                key={day.date}
                onClick={() => setSelectedDay(isSelected ? null : day)}
                className={`flex aspect-square items-center justify-center rounded-md text-[10px] font-medium text-[#2B2118] transition-all dark:text-neutral-100 ${colorFor(day)} ${
                  isSelected ? "ring-2 ring-[#4C3AA0] ring-offset-1 dark:ring-offset-neutral-900" : ""
                }`}
                title={`${day.date}: ${day.total} question${day.total !== 1 ? "s" : ""}`}
              >
                {dayNum}
              </button>
            );
          })}
        </div>
      </div>

      {selectedDay && (
        <div className="mt-4 rounded-xl bg-[#FFFBF2] p-3 text-sm dark:bg-neutral-800">
          <div className="font-semibold text-[#2B2118] dark:text-neutral-100">
            {new Date(selectedDay.date).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
          </div>
          <div className="mt-1 text-xs text-[#6B5D4F] dark:text-neutral-400">
            {selectedDay.total === 0
              ? "No practice this day."
              : `${selectedDay.total} question${selectedDay.total !== 1 ? "s" : ""} attempted, ${selectedDay.solved} solved.`}
          </div>
        </div>
      )}

      <p className="mt-4 border-t border-[#F0E6D6] pt-3 text-sm text-[#2B2118] dark:border-neutral-800 dark:text-neutral-300">
        <span className="font-bold">{activeDaysThisMonth}</span> active day{activeDaysThisMonth !== 1 ? "s" : ""} this month
        {totalThisMonth > 0 && <> · <span className="font-bold">{totalThisMonth}</span> questions attempted</>}
      </p>
    </div>
  );
}