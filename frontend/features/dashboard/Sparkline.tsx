export function Sparkline({ points, color = "#4C3AA0" }: { points: number[]; color?: string }) {
  if (points.length < 2) {
    return <div className="h-10 w-full" />;
  }

  const width = 140;
  const height = 40;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  const coords = points.map((p, i) => {
    const x = (i / (points.length - 1)) * width;
    const y = height - ((p - min) / range) * height;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const lastPoint = coords[coords.length - 1].split(",");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-10 w-full">
      <polyline points={coords.join(" ")} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastPoint[0]} cy={lastPoint[1]} r="3" fill={color} />
    </svg>
  );
}