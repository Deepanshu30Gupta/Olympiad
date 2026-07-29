interface CategoryBarChartProps {
  data: { categoryName: string; stars: number }[];
}

export function CategoryBarChart({ data }: CategoryBarChartProps) {
  return (
    <>
      <div className="dark:hidden">
        <HorizontalBars data={data} posColor="#FF6B4A" negColor="#D9502F" labelColor="#2B2118" subLabelColor="#6B5D4F" zeroLineColor="#D8CBB5" trackColor="#F5EFE3" />
      </div>
      <div className="hidden dark:block">
        <HorizontalBars data={data} posColor="#FF7A5C" negColor="#F87171" labelColor="#F5F5F5" subLabelColor="#A3A3A3" zeroLineColor="#404040" trackColor="#262626" />
      </div>
    </>
  );
}

function HorizontalBars({
  data,
  posColor,
  negColor,
  labelColor,
  subLabelColor,
  zeroLineColor,
  trackColor,
}: {
  data: { categoryName: string; stars: number }[];
  posColor: string;
  negColor: string;
  labelColor: string;
  subLabelColor: string;
  zeroLineColor: string;
  trackColor: string;
}) {
  const max = 5;
  const min = -5;
  const range = max - min;

  return (
    <div className="flex flex-col gap-4">
      {data.map((d) => {
        const isNeg = d.stars < 0;
        const zeroPct = (max / range) * 100;
        const fillPct = (Math.abs(d.stars) / range) * 100;

        return (
          <div key={d.categoryName}>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color: labelColor }}>
                {d.categoryName}
              </span>
              <span className="text-sm font-bold" style={{ color: isNeg ? negColor : posColor }}>
                ★ {d.stars}
              </span>
            </div>
            <div className="relative h-3 overflow-hidden rounded-full" style={{ backgroundColor: trackColor }}>
              <div className="absolute inset-y-0 w-px" style={{ left: `${zeroPct}%`, backgroundColor: zeroLineColor }} />
              <div
                className="absolute inset-y-0 rounded-full transition-all duration-500"
                style={{
                  backgroundColor: isNeg ? negColor : posColor,
                  left: isNeg ? `${zeroPct - fillPct}%` : `${zeroPct}%`,
                  width: `${fillPct}%`,
                }}
              />
            </div>
          </div>
        );
      })}
      <div className="mt-1 flex justify-between text-[10px]" style={{ color: subLabelColor }}>
        <span>★ {min}</span>
        <span>★ 0</span>
        <span>★ {max}</span>
      </div>
    </div>
  );
}