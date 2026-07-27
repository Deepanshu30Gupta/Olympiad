const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function colorForCount(count: number): string {
  if (count === 0) return "#F0E6D6";
  if (count <= 2) return "#C8E6BC";
  if (count <= 4) return "#8FCB77";
  if (count <= 6) return "#5CAE3F";
  return "#2E6B1B";
}

export function WeeklyHeatmap({ days }: { days: { date: string; count: number }[] }) {
  const weeks: { date: string; count: number }[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div className="flex gap-1.5">
      <div className="flex flex-col gap-1.5 pr-1 pt-1">
        {DAY_LABELS.map((d) => (
          <span key={d} className="flex h-4 items-center text-[10px] text-[#6B5D4F] dark:text-neutral-500">
            {d}
          </span>
        ))}
      </div>
      <div className="flex gap-1.5 overflow-x-auto">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1.5">
            {week.map((day) => (
              <div
                key={day.date}
                title={`${day.date}: ${day.count} question${day.count !== 1 ? "s" : ""}`}
                className="h-4 w-4 rounded-[3px]"
                style={{ backgroundColor: colorForCount(day.count) }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}