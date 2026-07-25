import { ratingToStars } from "@/lib/rating-display";

interface CategoryBarChartProps {
  data: { categoryName: string; rating: number }[];
}

export function CategoryBarChart({ data }: CategoryBarChartProps) {
  const starData = data.map((d) => ({ categoryName: d.categoryName, stars: ratingToStars(d.rating) }));

  return (
    <>
      <div className="dark:hidden">
        <BarSvg data={starData} barColor="#FF6B4A" labelColor="#2B2118" subLabelColor="#6B5D4F" />
      </div>
      <div className="hidden dark:block">
        <BarSvg data={starData} barColor="#FF7A5C" labelColor="#F5F5F5" subLabelColor="#A3A3A3" />
      </div>
    </>
  );
}

function BarSvg({
  data,
  barColor,
  labelColor,
  subLabelColor,
}: {
  data: { categoryName: string; stars: number }[];
  barColor: string;
  labelColor: string;
  subLabelColor: string;
}) {
  const width = 640;
  const height = 200;
  const padding = 32;
  const barWidth = (width - padding * 2) / data.length - 16;
  const max = 5;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "auto" }}>
      {data.map((d, i) => {
        const barHeight = (d.stars / max) * (height - padding * 2);
        const x = padding + i * ((width - padding * 2) / data.length) + 8;
        const y = height - padding - barHeight;
        return (
          <g key={d.categoryName}>
            <rect x={x} y={y} width={barWidth} height={Math.max(barHeight, 2)} rx="6" fill={barColor} />
            <text x={x + barWidth / 2} y={y - 6} fontSize="12" fontWeight="600" fill={labelColor} textAnchor="middle">
              ★ {d.stars}
            </text>
            <text x={x + barWidth / 2} y={height - padding + 16} fontSize="11" fill={subLabelColor} textAnchor="middle">
              {d.categoryName.length > 12 ? d.categoryName.slice(0, 11) + "…" : d.categoryName}
            </text>
          </g>
        );
      })}
    </svg>
  );
}