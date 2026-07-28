interface CategoryBarChartProps {
  data: { categoryName: string; stars: number }[];
}

export function CategoryBarChart({ data }: CategoryBarChartProps) {
  const starData = data;

  return (
    <>
      <div className="dark:hidden">
        <BarSvg data={starData} posColor="#FF6B4A" negColor="#D9502F" labelColor="#2B2118" subLabelColor="#6B5D4F" zeroLineColor="#D8CBB5" />
      </div>
      <div className="hidden dark:block">
        <BarSvg data={starData} posColor="#FF7A5C" negColor="#F87171" labelColor="#F5F5F5" subLabelColor="#A3A3A3" zeroLineColor="#404040" />
      </div>
    </>
  );
}

function BarSvg({
  data,
  posColor,
  negColor,
  labelColor,
  subLabelColor,
  zeroLineColor,
}: {
  data: { categoryName: string; stars: number }[];
  posColor: string;
  negColor: string;
  labelColor: string;
  subLabelColor: string;
  zeroLineColor: string;
}) {
  const width = 640;
  const height = 220;
  const paddingTop = 24;
  const paddingBottom = 32;
  const barWidth = (width - 40) / data.length - 16;

  const max = 5;
  const min = -5;
  const chartHeight = height - paddingTop - paddingBottom;
  const zeroY = paddingTop + (max / (max - min)) * chartHeight;
  const pxPerStar = chartHeight / (max - min);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "auto" }}>
      <line x1="20" y1={zeroY} x2={width - 20} y2={zeroY} stroke={zeroLineColor} strokeWidth="1.5" strokeDasharray="4 4" />
      <text x="20" y={zeroY + 4} fontSize="11" fill={subLabelColor}>0</text>

      {data.map((d, i) => {
        const x = 20 + i * ((width - 40) / data.length) + 8;
        const barHeight = Math.abs(d.stars) * pxPerStar;
        const isNeg = d.stars < 0;
        const y = isNeg ? zeroY : zeroY - barHeight;
        const labelY = isNeg ? y + barHeight + 14 : y - 6;

        return (
          <g key={d.categoryName}>
            <rect x={x} y={y} width={barWidth} height={Math.max(barHeight, 2)} rx="6" fill={isNeg ? negColor : posColor} />
            <text x={x + barWidth / 2} y={labelY} fontSize="12" fontWeight="600" fill={labelColor} textAnchor="middle">
              ★ {d.stars}
            </text>
            <text x={x + barWidth / 2} y={height - paddingBottom + 16} fontSize="11" fill={subLabelColor} textAnchor="middle">
              {d.categoryName.length > 12 ? d.categoryName.slice(0, 11) + "…" : d.categoryName}
            </text>
          </g>
        );
      })}
    </svg>
  );
}