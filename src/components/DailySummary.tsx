"use client";
import { formatNumber } from "@/lib/utils";

interface DailyMetric {
  views: number;
  reach: number;
  interactions: number;
  linkClicks: number;
  profileVisits: number;
  follows: number;
}

interface Props {
  dailyMetrics: DailyMetric[];
}

function SummaryCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="glass rounded-2xl p-5">
      <p className="text-white/40 text-xs uppercase tracking-wider mb-3">{icon} {label}</p>
      <p className="font-display text-2xl font-bold text-white">{formatNumber(value)}</p>
    </div>
  );
}

export function DailySummary({ dailyMetrics }: Props) {
  if (dailyMetrics.length === 0) return null;

  const total = dailyMetrics.reduce(
    (acc, d) => ({
      views: acc.views + d.views,
      reach: acc.reach + d.reach,
      interactions: acc.interactions + d.interactions,
      linkClicks: acc.linkClicks + d.linkClicks,
      profileVisits: acc.profileVisits + d.profileVisits,
      follows: acc.follows + d.follows,
    }),
    { views: 0, reach: 0, interactions: 0, linkClicks: 0, profileVisits: 0, follows: 0 }
  );

  return (
    <div className="mb-6">
      <h2 className="font-display text-lg font-semibold text-white mb-4">Ringkasan Periode</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <SummaryCard label="Total Views" value={total.views} icon="👁" />
        <SummaryCard label="Total Reach" value={total.reach} icon="📡" />
        <SummaryCard label="Interactions" value={total.interactions} icon="💬" />
        <SummaryCard label="Link Clicks" value={total.linkClicks} icon="🔗" />
        <SummaryCard label="Profile Visits" value={total.profileVisits} icon="👤" />
        <SummaryCard label="New Follows" value={total.follows} icon="➕" />
      </div>
    </div>
  );
}
