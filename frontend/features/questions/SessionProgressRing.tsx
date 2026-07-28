export function SessionProgressRing({
  solved,
  wrong,
  surrendered,
  accuracyPct,
}: {
  solved: number;
  wrong: number;
  surrendered: number;
  accuracyPct: number;
}) {
  const circumference = 2 * Math.PI * 40;
  const offset = circumference * (1 - accuracyPct / 100);

  return (
    <div className="rounded-2xl border border-[#F0E6D6] bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <h3 className="text-sm font-bold text-[#2B2118] dark:text-neutral-100">Your Progress</h3>
      <div className="mt-4 flex items-center gap-4">
        <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
          <svg viewBox="0 0 100 100" className="absolute h-full w-full -rotate-90">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#F0E6D6" strokeWidth="9" />
            <circle cx="50" cy="50" r="40" fill="none" stroke="#2E6B1B" strokeWidth="9" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} />
          </svg>
          <div className="text-center">
            <div className="text-xl font-extrabold text-[#2B2118] dark:text-neutral-100">{accuracyPct}%</div>
            <div className="text-[9px] text-[#6B5D4F] dark:text-neutral-500">Accuracy</div>
          </div>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <LegendRow color="#2E6B1B" label={`${solved} Solved`} bold />
          <LegendRow color="#D9502F" label={`${wrong} Wrong`} bold />
          <LegendRow color="#9C9184" label={`${surrendered} Not answered`} bold />
        </div>
      </div>
    </div>
  );
}

function LegendRow({ color, label, bold = false }: { color: string; label: string; bold?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: color }} />
      <span className={`text-[#2B2118] dark:text-neutral-300 ${bold ? "font-semibold" : ""}`}>{label}</span>
    </div>
  );
}