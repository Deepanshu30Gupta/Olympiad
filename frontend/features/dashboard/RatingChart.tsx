"use client";

import { useState, useMemo } from "react";
import { ratingToStars } from "@/lib/rating-display";

interface RatingChartProps {
  points: { date: string; timestamp: string; rating: number }[];
}

type FilterOption = "7d" | "30d" | "all";

export function RatingChart({ points }: RatingChartProps) {
  const [filter, setFilter] = useState<FilterOption>("30d");

  const starPoints = useMemo(() => points.map((p) => ({ timestamp: p.timestamp, stars: ratingToStars(p.rating) })), [points]);

  const filteredPoints = useMemo(() => {
    if (filter === "all") return starPoints;
    const days = filter === "7d" ? 7 : 30;
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    const filtered = starPoints.filter((p) => new Date(p.timestamp).getTime() >= cutoff);
    return filtered.length >= 2 ? filtered : starPoints.slice(-2);
  }, [starPoints, filter]);

  const sevenDayComparison = useMemo(() => {
    if (starPoints.length < 2) return null;
    const current = starPoints[starPoints.length - 1].stars;
    const sevenDaysAgoTime = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const pastPoint = [...starPoints].reverse().find((p) => new Date(p.timestamp).getTime() <= sevenDaysAgoTime);
    if (!pastPoint) return null;
    return Math.round((current - pastPoint.stars) * 10) / 10;
  }, [starPoints]);

  if (points.length < 2) {
    return (
      <div className="py-10 text-center text-sm text-[#6B5D4F] dark:text-neutral-500">
        Not enough data yet — this fills in as you practice.
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1.5">
          {(["7d", "30d", "all"] as FilterOption[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                filter === f
                  ? "bg-[#4C3AA0] text-white"
                  : "bg-[#F0E6D6] text-[#6B5D4F] hover:bg-[#E5D9C5] dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
              }`}
            >
              {f === "7d" ? "7 Days" : f === "30d" ? "30 Days" : "All Time"}
            </button>
          ))}
        </div>
        {sevenDayComparison !== null && (
          <span className={`text-xs font-semibold ${sevenDayComparison >= 0 ? "text-[#2E6B1B]" : "text-[#D9502F]"}`}>
            {sevenDayComparison >= 0 ? "▲" : "▼"} {Math.abs(sevenDayComparison)} vs. 7 days ago
          </span>
        )}
      </div>

      <div className="mt-4">
        <div className="dark:hidden">
          <ChartSvg points={filteredPoints} lineColor="#4C3AA0" areaColor="#ECE8FA" textColor="#6B5D4F" zeroLineColor="#D8CBB5" tooltipBg="#2B2118" tooltipText="#FFFBF2" />
        </div>
        <div className="hidden dark:block">
          <ChartSvg points={filteredPoints} lineColor="#A5A0E8" areaColor="#2A2550" textColor="#A3A3A3" zeroLineColor="#404040" tooltipBg="#F5F5F5" tooltipText="#171717" />
        </div>
      </div>
    </div>
  );
}

function ChartSvg({
  points,
  lineColor,
  areaColor,
  textColor,
  zeroLineColor,
  tooltipBg,
  tooltipText,
}: {
  points: { timestamp: string; stars: number }[];
  lineColor: string;
  areaColor: string;
  textColor: string;
  zeroLineColor: string;
  tooltipBg: string;
  tooltipText: string;
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const width = 640;
  const height = 220;
  const padding = 24;

  const max = 5;
  const min = -5;
  const range = max - min;

  const yFor = (stars: number) => height - padding - ((stars - min) / range) * (height - padding * 2);
  const zeroY = yFor(0);

  const coords = points.map((p, i) => ({
    x: padding + (i / Math.max(1, points.length - 1)) * (width - padding * 2),
    y: yFor(p.stars),
  }));

  const pathD = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(" ");
  const areaD = `${pathD} L ${coords[coords.length - 1].x.toFixed(1)} ${height - padding} L ${coords[0].x.toFixed(1)} ${height - padding} Z`;

  const hovered = hoverIndex !== null ? { point: points[hoverIndex], coord: coords[hoverIndex], index: hoverIndex } : null;

  function handleMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const relativeX = ((e.clientX - rect.left) / rect.width) * width;
    let closest = 0;
    let closestDist = Infinity;
    coords.forEach((c, i) => {
      const dist = Math.abs(c.x - relativeX);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    });
    setHoverIndex(closest);
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "auto" }} onMouseMove={handleMove} onMouseLeave={() => setHoverIndex(null)}>
      <path d={areaD} fill={areaColor} />
      <line x1={padding} y1={zeroY} x2={width - padding} y2={zeroY} stroke={zeroLineColor} strokeWidth="1.5" strokeDasharray="4 4" />
      <path d={pathD} fill="none" stroke={lineColor} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {coords.length <= 60 && coords.map((c, i) => <circle key={i} cx={c.x} cy={c.y} r={hoverIndex === i ? 4.5 : 3} fill={lineColor} />)}

      <text x={padding} y={16} fontSize="12" fill={textColor}>★ {max}</text>
      <text x={padding} y={zeroY - 6} fontSize="12" fill={textColor}>★ 0</text>
      <text x={padding} y={height - padding + 4} fontSize="12" fill={textColor}>★ {min}</text>

      {hovered && (
        <>
          <line x1={hovered.coord.x} y1={padding} x2={hovered.coord.x} y2={height - padding} stroke={lineColor} strokeWidth="1" strokeDasharray="2 3" opacity="0.5" />
          <TooltipBox coord={hovered.coord} point={hovered.point} prevPoint={hovered.index > 0 ? points[hovered.index - 1] : null} width={width} bg={tooltipBg} text={tooltipText} />
        </>
      )}
    </svg>
  );
}

function TooltipBox({
  coord,
  point,
  prevPoint,
  width,
  bg,
  text,
}: {
  coord: { x: number; y: number };
  point: { timestamp: string; stars: number };
  prevPoint: { timestamp: string; stars: number } | null;
  width: number;
  bg: string;
  text: string;
}) {
  const d = new Date(point.timestamp);
  const dateLabel = d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  const timeLabel = d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  const delta = prevPoint ? Math.round((point.stars - prevPoint.stars) * 10) / 10 : null;

  const boxWidth = 148;
  const boxHeight = delta !== null ? 58 : 44;
  let boxX = coord.x - boxWidth / 2;
  if (boxX < 4) boxX = 4;
  if (boxX + boxWidth > width - 4) boxX = width - 4 - boxWidth;
  const boxY = coord.y > 70 ? coord.y - boxHeight - 12 : coord.y + 12;

  return (
    <g pointerEvents="none">
      <rect x={boxX} y={boxY} width={boxWidth} height={boxHeight} rx="8" fill={bg} opacity="0.95" />
      <text x={boxX + 10} y={boxY + 17} fontSize="12" fontWeight="700" fill={text}>
        ★ {point.stars} rating
      </text>
      <text x={boxX + 10} y={boxY + 32} fontSize="10.5" fill={text} opacity="0.8">
        {dateLabel} · {timeLabel}
      </text>
      {delta !== null && (
        <text x={boxX + 10} y={boxY + 47} fontSize="10.5" fontWeight="600" fill={delta >= 0 ? "#6FCF52" : "#FF6B6B"}>
          {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)} from previous
        </text>
      )}
    </g>
  );
}