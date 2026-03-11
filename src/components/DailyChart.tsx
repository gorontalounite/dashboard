"use client";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import type { DailyMetricData } from "@/types";
import { formatNumber } from "@/lib/utils";

interface Props {
  dailyMetrics: DailyMetricData[];
}

function useChartColors() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = !mounted || resolvedTheme === "dark";
  return {
    tickColor: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)",
    gridColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)",
    tooltipBg: isDark ? "#1a1a24" : "#ffffff",
    tooltipBorder: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
    tooltipText: isDark ? "#ffffff" : "#111111",
    tooltipMuted: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
  };
}

type MetricKey = "views" | "reach" | "interactions" | "follows" | "profileVisits";

const METRICS: { key: MetricKey; label: string; color: string }[] = [
  { key: "views", label: "Views", color: "#f97316" },
  { key: "reach", label: "Reach", color: "#6366f1" },
  { key: "interactions", label: "Interactions", color: "#ec4899" },
  { key: "follows", label: "Follows", color: "#14b8a6" },
  { key: "profileVisits", label: "Profile Visits", color: "#f59e0b" },
];

export function DailyChart({ dailyMetrics }: Props) {
  const colors = useChartColors();
  const [activeMetrics, setActiveMetrics] = useState<MetricKey[]>(["views", "reach", "interactions"]);

  if (!dailyMetrics || dailyMetrics.length === 0) return null;

  const data = dailyMetrics.map((d) => ({
    date: new Date(d.date).toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
    views: d.views,
    reach: d.reach,
    interactions: d.interactions,
    follows: d.follows,
    profileVisits: d.profileVisits,
  }));

  function toggleMetric(key: MetricKey) {
    setActiveMetrics((prev) =>
      prev.includes(key)
        ? prev.length > 1 ? prev.filter((k) => k !== key) : prev
        : [...prev, key]
    );
  }

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h3 className="font-display font-semibold text-white">Tren Harian</h3>
          <p className="text-white/40 text-xs mt-0.5">{dailyMetrics.length} hari · dari Business Suite</p>
        </div>
        {/* Metric toggles */}
        <div className="flex flex-wrap gap-2">
          {METRICS.map((m) => (
            <button
              key={m.key}
              onClick={() => toggleMetric(m.key)}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${
                activeMetrics.includes(m.key)
                  ? "border-white/20 bg-white/5 text-white/70"
                  : "border-white/5 bg-transparent text-white/25"
              }`}
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: activeMetrics.includes(m.key) ? m.color : "rgba(255,255,255,0.15)" }}
              />
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ left: 0, right: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.gridColor} />
          <XAxis
            dataKey="date"
            tick={{ fill: colors.tickColor, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            interval={Math.floor(data.length / 7)}
          />
          <YAxis
            tickFormatter={(v: number) => formatNumber(v)}
            tick={{ fill: colors.tickColor, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={50}
          />
          <Tooltip
            contentStyle={{
              background: colors.tooltipBg,
              border: `1px solid ${colors.tooltipBorder}`,
              borderRadius: 12,
              fontSize: 12,
            }}
            labelStyle={{ color: colors.tooltipMuted, marginBottom: 4 }}
            itemStyle={{ color: colors.tooltipText }}
            formatter={(value: number) => formatNumber(value)}
          />
          {METRICS.filter((m) => activeMetrics.includes(m.key)).map((m) => (
            <Line
              key={m.key}
              type="monotone"
              dataKey={m.key}
              name={m.label}
              stroke={m.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}