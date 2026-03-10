// src/app/dashboard/compare/page.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import type { ReportListItem, ReportWithData } from "@/types";
import { formatNumber, formatDate } from "@/lib/utils";

const METRICS = [
  { key: "views" as const, label: "Views" },
  { key: "interactions" as const, label: "Interactions" },
  { key: "accountsReached" as const, label: "Accounts Reached" },
];

export default function ComparePage() {
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [details, setDetails] = useState<ReportWithData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    const res = await fetch("/api/reports");
    const data = await res.json() as ReportListItem[];
    setReports(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchReports();
  }, [fetchReports]);

  useEffect(() => {
    if (selected.length === 0) {
      setDetails([]);
      return;
    }

    void Promise.all(
      selected.map((id) => fetch(`/api/reports/${id}`).then((r) => r.json() as Promise<ReportWithData>))
    ).then(setDetails);
  }, [selected]);

  function toggleSelect(id: string) {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length < 4
        ? [...prev, id]
        : prev
    );
  }

  const chartData = METRICS.map((m) => {
    const entry: Record<string, string | number> = { metric: m.label };
    details.forEach((d) => {
      entry[d.title] = d.metrics?.[m.key] ?? 0;
    });
    return entry;
  });

  const COLORS = ["#f97316", "#ec4899", "#6366f1", "#14b8a6"];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-white">Perbandingan Periode</h1>
        <p className="text-white/40 text-sm mt-1">Pilih hingga 4 report untuk dibandingkan.</p>
      </div>

      {/* Select reports */}
      <div className="glass rounded-2xl p-6 mb-6">
        <h2 className="font-display font-semibold text-white mb-4 text-sm">Pilih Report</h2>
        {loading ? (
          <p className="text-white/30 text-sm">Memuat...</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {reports.map((r) => {
              const isSelected = selected.includes(r.id);
              return (
                <button
                  key={r.id}
                  onClick={() => toggleSelect(r.id)}
                  className={`text-left p-4 rounded-xl border transition-all ${
                    isSelected
                      ? "border-orange-500/40 bg-orange-500/10"
                      : "border-white/10 bg-white/3 hover:bg-white/5"
                  }`}
                >
                  <p className="text-white text-sm font-medium truncate">{r.title}</p>
                  <p className="text-white/40 text-xs mt-0.5">
                    {formatDate(r.periodStart)} – {formatDate(r.periodEnd)}
                  </p>
                  {isSelected && (
                    <div
                      className="w-3 h-3 rounded-full mt-2"
                      style={{ background: COLORS[selected.indexOf(r.id)] }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Chart */}
      {details.length >= 2 && (
        <div className="glass rounded-2xl p-6 mb-6">
          <h2 className="font-display font-semibold text-white mb-6">Perbandingan Metrik Utama</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="metric" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v: number) => formatNumber(v)} tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "#1a1a24", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }}
                labelStyle={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}
                itemStyle={{ color: "white", fontSize: 13 }}
                formatter={(v: number) => formatNumber(v)}
              />
              <Legend
                formatter={(value) => <span className="text-white/60 text-xs">{value}</span>}
              />
              {details.map((d, i) => (
                <Bar key={d.id} dataKey={d.title} fill={COLORS[i]} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Table comparison */}
      {details.length >= 2 && (
        <div className="glass rounded-2xl p-6">
          <h2 className="font-display font-semibold text-white mb-4">Tabel Perbandingan</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-white/40 font-medium py-2 pr-6">Metrik</th>
                  {details.map((d, i) => (
                    <th key={d.id} className="text-right py-2 px-4">
                      <span style={{ color: COLORS[i] }} className="font-medium">
                        {d.title}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "Views", key: "views" as const },
                  { label: "Accounts Reached", key: "accountsReached" as const },
                  { label: "Interactions", key: "interactions" as const },
                  { label: "Likes", key: "likes" as const },
                  { label: "Comments", key: "comments" as const },
                  { label: "Saves", key: "saves" as const },
                  { label: "Shares", key: "shares" as const },
                  { label: "Profile Visits", key: "profileVisits" as const },
                  { label: "Follows Gained", key: "followsGained" as const },
                  { label: "Net Growth", key: "netFollowerGrowth" as const },
                ].map((row) => (
                  <tr key={row.key} className="border-b border-white/3 hover:bg-white/2 transition-colors">
                    <td className="text-white/60 py-3 pr-6">{row.label}</td>
                    {details.map((d) => (
                      <td key={d.id} className="text-right py-3 px-4 text-white font-display font-semibold">
                        {formatNumber(d.metrics?.[row.key] ?? 0)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {details.length < 2 && selected.length > 0 && (
        <div className="glass rounded-2xl p-8 text-center">
          <p className="text-white/30 text-sm">Pilih minimal 2 report untuk melihat perbandingan.</p>
        </div>
      )}
    </div>
  );
}
