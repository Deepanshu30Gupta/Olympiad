export function RatingWidgetIllustration() {
  const topics = [
    { name: "Number Theory", value: 3.12, color: "#6FCF52", pct: 81 },
    { name: "Algebra", value: 0.45, color: "#FFB238", pct: 55 },
    { name: "Geometry", value: -1.2, color: "#FF6B4A", pct: 38 },
    { name: "Combinatorics", value: 1.85, color: "#6FCF52", pct: 69 },
    { name: "Inequalities", value: -0.85, color: "#4C3AA0", pct: 42 },
  ];

  return (
    <div className="relative mx-auto w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ECE8FA]">
          <span className="text-lg">🧑</span>
        </div>
        <div>
          <div className="text-xs text-[#6B5D4F]">Your Rating</div>
          <div className="flex items-center gap-2">
            <span
              className="text-2xl font-bold text-[#4C3AA0]"
              style={{ fontFamily: "var(--font-fredoka), sans-serif" }}
            >
              2.34
            </span>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
              ↑ 0.76
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <div className="relative h-1.5 rounded-full bg-gradient-to-r from-[#FF6B4A] via-[#F0E6D6] to-[#6FCF52]">
          <div
            className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-[#4C3AA0] bg-white"
            style={{ left: "68%" }}
          />
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-[#6B5D4F]">
          <span>-5</span>
          <span>-3</span>
          <span>-1</span>
          <span>0</span>
          <span>1</span>
          <span>3</span>
          <span>5</span>
        </div>
        <div className="mt-1 flex justify-between text-[10px] font-semibold">
          <span className="text-[#FF6B4A]">Very Hard</span>
          <span className="text-[#4C3AA0]">Just Right</span>
          <span className="text-[#6FCF52]">Very Easy</span>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 text-xs font-semibold text-[#2B2118]">Topic Ratings</div>
        <div className="flex flex-col gap-2.5">
          {topics.map((t) => (
            <div key={t.name} className="flex items-center gap-3">
              <span className="w-28 shrink-0 text-xs text-[#2B2118]">{t.name}</span>
              <div className="h-1.5 flex-1 rounded-full bg-[#F0E6D6]">
                <div
                  className="h-1.5 rounded-full"
                  style={{ width: `${t.pct}%`, backgroundColor: t.color }}
                />
              </div>
              <span className="w-10 shrink-0 text-right text-xs font-semibold" style={{ color: t.color }}>
                {t.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}