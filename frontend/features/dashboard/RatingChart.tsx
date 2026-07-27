import { ratingToStars } from "@/lib/rating-display";

interface RatingChartProps {
  points: { date: string; rating: number }[];
}

export function RatingChart({ points }: RatingChartProps) {
  if (points.length < 2) {
    return (
      <div className="py-10 text-center text-sm text-[#6B5D4F] dark:text-neutral-500">
        Not enough data yet — this fills in as you practice.
      </div>
    );
  }

  const starPoints = points.map((p) => ({ date: p.date, stars: ratingToStars(p.rating) }));

  return (
    <>
      <div className="dark:hidden">
        <ChartSvg points={starPoints} lineColor="#4C3AA0" areaColor="#ECE8FA" textColor="#6B5D4F" zeroLineColor="#D8CBB5" />
      </div>
      <div className="hidden dark:block">
        <ChartSvg points={starPoints} lineColor="#A5A0E8" areaColor="#2A2550" textColor="#A3A3A3" zeroLineColor="#404040" />
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
}: {
  points: { date: string; stars: number }[];
  lineColor: string;
  areaColor: string;
  textColor: string;
  zeroLineColor: string;
}) {
  const width = 640;
  const height = 200;
  const padding = 24;

  const actualMin = Math.min(...points.map((p) => p.stars));
  const max = 5;
  const min = actualMin < 0 ? Math.floor(actualMin) - 1 : 0;
  const range = max - min;

  const yFor = (stars: number) => height - padding - ((stars - min) / range) * (height - padding * 2);

  const coords = points.map((p, i) => ({
    x: padding + (i / (points.length - 1)) * (width - padding * 2),
    y: yFor(p.stars),
  }));

  const pathD = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(" ");
  const zeroY = yFor(0);
  const baselineY = height - padding;
  const areaD = `${pathD} L ${coords[coords.length - 1].x.toFixed(1)} ${baselineY} L ${coords[0].x.toFixed(1)} ${baselineY} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "auto" }}>
      <path d={areaD} fill={areaColor} />

      {min < 0 && (
        <>
          <line x1={padding} y1={zeroY} x2={width - padding} y2={zeroY} stroke={zeroLineColor} strokeWidth="1.5" strokeDasharray="4 4" />
          <text x={width - padding} y={zeroY - 4} fontSize="11" fill={textColor} textAnchor="end">
            ★ 0
          </text>
        </>
      )}

      <path d={pathD} fill="none" stroke={lineColor} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {coords.length <= 40 && coords.map((c, i) => <circle key={i} cx={c.x} cy={c.y} r="3" fill={lineColor} />)}

      <text x={padding} y={16} fontSize="12" fill={textColor}>
        ★ {max}
      </text>
      <text x={padding} y={height - padding + 4} fontSize="12" fill={textColor}>
        ★ {min}
      </text>
    </svg>
  );
}