"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface RecipientInfo {
  name: string | null;
  email: string;
}

export function RecipientListToggle({ recipients }: { recipients: RecipientInfo[] }) {
  const [open, setOpen] = useState(false);

  if (recipients.length === 0) return null;

  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-xs font-semibold text-[#4C3AA0] dark:text-indigo-400"
      >
        {open ? "Hide recipients" : "Show recipients"}
        <ChevronDown size={13} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {recipients.map((r, i) => (
            <span key={i} className="rounded-full bg-[#FFFBF2] px-2.5 py-1 text-xs text-[#2B2118] dark:bg-neutral-800 dark:text-neutral-300">
              {r.name ?? r.email}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}