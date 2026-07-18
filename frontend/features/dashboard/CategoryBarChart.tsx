interface CategoryBarChartProps {
  data: { categoryName: string; rating: number }[];
}

export function CategoryBarChart({ data }: CategoryBarChartProps) {
  const width = 640;
  const height = 200;
  const padding = 32;
  const barWidth = (width - padding * 2) / data.length - 16;

  const max = Math.max(...data.map((d) => d.rating), 1400);
  const min = 800;
  const range = max - min || 1;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "auto" }}>
      {data.map((d, i) => {
        const barHeight = ((d.rating - min) / range) * (height - padding * 2);
        const x = padding + i * ((width - padding * 2) / data.length) + 8;
        const y = height - padding - barHeight;
        return (
          <g key={d.categoryName}>
            <rect x={x} y={y} width={barWidth} height={Math.max(barHeight, 2)} rx="6" fill="#FF6B4A" />
            <text
              x={x + barWidth / 2}
              y={y - 6}
              fontSize="12"
              fontWeight="600"
              fill="#2B2118"
              textAnchor="middle"
            >
              {d.rating}
            </text>
            <text
              x={x + barWidth / 2}
              y={height - padding + 16}
              fontSize="11"
              fill="#6B5D4F"
              textAnchor="middle"
            >
              {d.categoryName.length > 12 ? d.categoryName.slice(0, 11) + "…" : d.categoryName}
            </text>
          </g>
        );
      })}
    </svg>
  );
}