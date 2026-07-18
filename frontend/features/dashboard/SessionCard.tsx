"use client";

import { useState } from "react";
import Link from "next/link";
import { renameSessionAction } from "@/app/practice/actions";

interface SessionCardProps {
  id: string;
  name: string;
  status: string;
  startedAt: string;
  questionsCompleted: number;
  solved: number;
  wrong: number;
  surrendered: number;
  totalTimeSeconds: number;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function SessionCard({
  id,
  name,
  status,
  startedAt,
  questionsCompleted,
  solved,
  wrong,
  surrendered,
  totalTimeSeconds,
}: SessionCardProps) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [nameValue, setNameValue] = useState(name);
  const [saving, setSaving] = useState(false);

  async function saveRename() {
    if (!nameValue.trim() || nameValue === name) {
      setEditing(false);
      setNameValue(name);
      return;
    }
    setSaving(true);
    try {
      await renameSessionAction(id, nameValue);
    } finally {
      setSaving(false);
      setEditing(false);
    }
  }

  const dateLabel = new Date(startedAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div style={{ background: "white", border: "1px solid #F0E6D6", borderRadius: 16, padding: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {editing ? (
            <input
              autoFocus
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              onBlur={saveRename}
              onKeyDown={(e) => e.key === "Enter" && saveRename()}
              disabled={saving}
              style={{
                fontFamily: "var(--font-fredoka)",
                fontWeight: 600,
                fontSize: 16,
                border: "1px solid #4C3AA0",
                borderRadius: 8,
                padding: "4px 8px",
              }}
            />
          ) : (
            <button
              onClick={() => setEditing(true)}
              style={{
                fontFamily: "var(--font-fredoka)",
                fontWeight: 600,
                fontSize: 16,
                color: "#2B2118",
                background: "none",
                border: "none",
                cursor: "text",
                padding: 0,
              }}
              title="Click to rename"
            >
              {name}
            </button>
          )}
          {status === "ACTIVE" && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#2E6B1B",
                background: "#E6F7E0",
                padding: "2px 8px",
                borderRadius: 999,
              }}
            >
              Active
            </span>
          )}
        </div>
        <span style={{ fontSize: 13, color: "#6B5D4F" }}>{dateLabel}</span>
      </div>

      <div style={{ display: "flex", gap: 16, marginTop: 10, fontSize: 13 }}>
        <span style={{ color: "#2E6B1B" }}>{solved} solved</span>
        <span style={{ color: "#D9502F" }}>{wrong} wrong</span>
        <span style={{ color: "#6B5D4F" }}>{surrendered} gave up</span>
        <span style={{ color: "#6B5D4F", marginLeft: "auto" }}>{formatTime(totalTimeSeconds)}</span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
        <button
          onClick={() => setOpen(!open)}
          style={{ fontSize: 13, fontWeight: 600, color: "#4C3AA0", background: "none", border: "none", cursor: "pointer", padding: 0 }}
        >
          {open ? "Hide" : "Show"} details {open ? "▲" : "▼"}
        </button>
        {status === "ACTIVE" && (
          <Link
            href={`/practice?sessionId=${id}`}
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "white",
              background: "#FF6B4A",
              padding: "6px 14px",
              borderRadius: 999,
            }}
          >
            Resume →
          </Link>
        )}
      </div>

      {open && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #F0E6D6", fontSize: 13, color: "#6B5D4F" }}>
          {questionsCompleted} question{questionsCompleted !== 1 ? "s" : ""} completed in this session.
        </div>
      )}
    </div>
  );
}