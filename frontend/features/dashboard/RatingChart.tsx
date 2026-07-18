interface RatingChartProps {
  points: { date: string; rating: number }[];
}

export function RatingChart({ points }: RatingChartProps) {
  if (points.length < 2) {
    return (
      <div style={{ fontSize: 13, color: "#6B5D4F", padding: "40px 0", textAlign: "center" }}>
        Not enough data yet — this fills in as you practice.
      </div>
    );
  }

  const width = 640;
  const height = 180;
  const padding = 24;

  const ratings = points.map((p) => p.rating);
  const min = Math.min(...ratings) - 20;
  const max = Math.max(...ratings) + 20;
  const range = max - min || 1;

  const coords = points.map((p, i) => {
    const x = padding + (i / (points.length - 1)) * (width - padding * 2);
    const y = height - padding - ((p.rating - min) / range) * (height - padding * 2);
    return { x, y };
  });

  const pathD = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(" ");
  const areaD = `${pathD} L ${coords[coords.length - 1].x.toFixed(1)} ${height - padding} L ${coords[0].x.toFixed(1)} ${height - padding} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "auto" }}>
      <path d={areaD} fill="#ECE8FA" />
      <path d={pathD} fill="none" stroke="#4C3AA0" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {coords.length <= 40 &&
        coords.map((c, i) => <circle key={i} cx={c.x} cy={c.y} r="3" fill="#4C3AA0" />)}
      <text x={padding} y={16} fontSize="12" fill="#6B5D4F">
        {max}
      </text>
      <text x={padding} y={height - padding + 4} fontSize="12" fill="#6B5D4F">
        {min}
      </text>
    </svg>
  );
}