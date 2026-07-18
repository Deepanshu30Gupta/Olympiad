"use client";

import { useState } from "react";

interface AttemptRow {
  externalId: string;
  statement: string;
  status: string;
  activeSolvingSeconds: number | null;
  submittedAt: string | null;
}

interface TopicCardProps {
  categoryName: string;
  rating: number;
  solved: number;
  wrong: number;
  surrendered: number;
  totalTimeSeconds: number;
  attempts: AttemptRow[];
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  SOLVED: { bg: "#E6F7E0", color: "#2E6B1B", label: "Solved" },
  WRONG: { bg: "#FFE8E0", color: "#D9502F", label: "Wrong" },
  SURRENDERED: { bg: "#F0E6D6", color: "#6B5D4F", label: "Gave up" },
};

export function TopicCard({
  categoryName,
  rating,
  solved,
  wrong,
  surrendered,
  totalTimeSeconds,
  attempts,
}: TopicCardProps) {
  const [open, setOpen] = useState(false);
  const total = solved + wrong + surrendered;
  const accuracy = total > 0 ? Math.round((solved / total) * 100) : null;

  return (
    <div style={{ background: "white", border: "1px solid #F0E6D6", borderRadius: 18, padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontFamily: "var(--font-fredoka)", fontWeight: 600, fontSize: 17, color: "#2B2118" }}>
            {categoryName}
          </div>
          <div style={{ fontSize: 13, color: "#6B5D4F", marginTop: 2 }}>
            {total} attempted{accuracy !== null ? ` · ${accuracy}% accuracy` : ""}
          </div>
        </div>
        <div style={{ fontFamily: "var(--font-fredoka)", fontWeight: 700, fontSize: 24, color: "#4C3AA0" }}>
          {rating}
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, marginTop: 14, fontSize: 13 }}>
        <span style={{ color: "#2E6B1B" }}>{solved} solved</span>
        <span style={{ color: "#D9502F" }}>{wrong} wrong</span>
        <span style={{ color: "#6B5D4F" }}>{surrendered} gave up</span>
        <span style={{ color: "#6B5D4F", marginLeft: "auto" }}>{formatTime(totalTimeSeconds)} total</span>
      </div>

      {attempts.length > 0 && (
        <button
          onClick={() => setOpen(!open)}
          style={{
            marginTop: 14,
            fontSize: 13,
            fontWeight: 600,
            color: "#4C3AA0",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          {open ? "Hide" : "Show"} question history ({attempts.length}) {open ? "▲" : "▼"}
        </button>
      )}

      {open && (
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
          {attempts.map((a, i) => {
            const style = STATUS_STYLE[a.status] ?? STATUS_STYLE.WRONG;
            return (
              <div
                key={`${a.externalId}-${i}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 10px",
                  background: "#FFFBF2",
                  borderRadius: 10,
                  fontSize: 13,
                }}
              >
                <span
                  style={{
                    background: style.bg,
                    color: style.color,
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: 999,
                    flexShrink: 0,
                  }}
                >
                  {style.label}
                </span>
                <span style={{ color: "#2B2118", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {a.externalId}
                </span>
                <span style={{ color: "#6B5D4F", fontFamily: "var(--font-mono, monospace)", flexShrink: 0 }}>
                  {a.activeSolvingSeconds !== null ? formatTime(a.activeSolvingSeconds) : "—"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}