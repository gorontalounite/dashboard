// src/components/StatCard.tsx
import { formatNumber, formatPercent } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number;
  change?: number;
  suffix?: string;
  accent?: "orange" | "pink" | "blue" | "green";
  icon?: React.ReactNode;
}

const accentMap = {
  orange: "from-orange-500/10 to-orange-500/0 border-orange-500/15 text-orange-400",
  pink: "from-pink-500/10 to-pink-500/0 border-pink-500/15 text-pink-400",
  blue: "from-indigo-500/10 to-indigo-500/0 border-indigo-500/15 text-indigo-400",
  green: "from-emerald-500/10 to-emerald-500/0 border-emerald-500/15 text-emerald-400",
};

export function StatCard({ label, value, change, suffix, accent = "orange", icon }: StatCardProps) {
  const accentClass = accentMap[accent];

  return (
    <div className={cn("rounded-2xl border bg-gradient-to-br p-5 relative overflow-hidden", accentClass)}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs text-white/40 uppercase tracking-wider font-medium">{label}</p>
        {icon && <div className="opacity-60">{icon}</div>}
      </div>
      <p className="font-display text-2xl font-bold text-white leading-none">
        {formatNumber(value)}{suffix}
      </p>
      {change !== undefined && (
        <p className={cn("text-xs mt-2 font-medium", change >= 0 ? "text-emerald-400" : "text-red-400")}>
          {formatPercent(change)} vs periode sebelumnya
        </p>
      )}
    </div>
  );
}
