import { CountUp } from "@/components/ui/CountUp";

export function QuickProgressCard({
  icon,
  iconBg,
  label,
  value,
  decimals = 0,
  suffix = "",
  trend,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: number;
  decimals?: number;
  suffix?: string;
  trend?: { value: number; label: string } | null;
}) {
  const trendUp = trend ? trend.value >= 0 : null;

  return (
    <div className="rounded-2xl border border-[#F0E6D6] bg-white p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: iconBg }}>
        {icon}
      </div>
      <div className="mt-3 text-xs text-[#6B5D4F] dark:text-neutral-500">{label}</div>
      <div className="text-xl font-bold text-[#2B2118] dark:text-neutral-100" style={{ fontFamily: "var(--font-fredoka), sans-serif" }}>
        <CountUp value={value} decimals={decimals} suffix={suffix} />
      </div>
      {trend && (
        <div className={`text-xs font-semibold ${trendUp ? "text-[#2E6B1B]" : "text-[#D9502F]"}`}>
          {trendUp ? "↑" : "↓"} {Math.abs(trend.value)} {trend.label}
        </div>
      )}
    </div>
  );
}