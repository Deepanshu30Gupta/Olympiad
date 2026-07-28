"use client";

import { useState } from "react";
import { ratingToStars } from "@/lib/rating-display";

interface RatingChartProps {
  points: { date: string; timestamp: string; rating: number }[];
}

export function RatingChart({ points }: RatingChartProps) {
  if (points.length < 2) {
    return (
      <div className="py-10 text-center text-sm text-[#6B5D4F] dark:text-neutral-500">
        Not enough data yet — this fills in as you practice.
      </div>
    );
  }

  const starPoints = points.map((p) => ({ timestamp: p.timestamp, stars: ratingToStars(p.rating) }));

  return (
    <>
      <div className="dark:hidden">
        <ChartSvg points={starPoints} lineColor="#4C3AA0" areaColor="#ECE8FA" textColor="#6B5D4F" zeroLineColor="#D8CBB5" tooltipBg="#2B2118" tooltipText="#FFFBF2" />
      </div>
      <div className="hidden dark:block">
        <ChartSvg points={starPoints} lineColor="#A5A0E8" areaColor="#2A2550" textColor="#A3A3A3" zeroLineColor="#404040" tooltipBg="#F5F5F5" tooltipText="#171717" />
      </div>
    </>
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
    x: padding + (i / (points.length - 1)) * (width - padding * 2),
    y: yFor(p.stars),
  }));

  const pathD = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(" ");
  const areaD = `${pathD} L ${coords[coords.length - 1].x.toFixed(1)} ${height - padding} L ${coords[0].x.toFixed(1)} ${height - padding} Z`;

  const hovered = hoverIndex !== null ? { point: points[hoverIndex], coord: coords[hoverIndex] } : null;

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
    <svg
      viewBox={`0 0 ${width} ${height}`}
      style={{ width: "100%", height: "auto" }}
      onMouseMove={handleMove}
      onMouseLeave={() => setHoverIndex(null)}
    >
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
          <TooltipBox coord={hovered.coord} point={hovered.point} width={width} bg={tooltipBg} text={tooltipText} />
        </>
      )}
    </svg>
  );
}

function TooltipBox({
  coord,
  point,
  width,
  bg,
  text,
}: {
  coord: { x: number; y: number };
  point: { timestamp: string; stars: number };
  width: number;
  bg: string;
  text: string;
}) {
  const d = new Date(point.timestamp);
  const dateLabel = d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  const timeLabel = d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

  const boxWidth = 130;
  const boxHeight = 44;
  let boxX = coord.x - boxWidth / 2;
  if (boxX < 4) boxX = 4;
  if (boxX + boxWidth > width - 4) boxX = width - 4 - boxWidth;
  const boxY = coord.y > 60 ? coord.y - boxHeight - 12 : coord.y + 12;

  return (
    <g pointerEvents="none">
      <rect x={boxX} y={boxY} width={boxWidth} height={boxHeight} rx="8" fill={bg} opacity="0.95" />
      <text x={boxX + 10} y={boxY + 17} fontSize="12" fontWeight="700" fill={text}>
        ★ {point.stars} rating
      </text>
      <text x={boxX + 10} y={boxY + 32} fontSize="10.5" fill={text} opacity="0.8">
        {dateLabel} · {timeLabel}
      </text>
    </g>
  );
}