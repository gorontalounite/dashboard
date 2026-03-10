// src/components/ReportCharts.tsx
"use client";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import type { ReportWithData } from "@/types";
import { formatNumber } from "@/lib/utils";

const COLORS_CONTENT = ["#f97316", "#ec4899", "#6366f1", "#14b8a6"];
const COLORS_GENDER = ["#6366f1", "#ec4899"];

interface Props {
  report: ReportWithData;
}

function useChartColors() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = !mounted || resolvedTheme === "dark";

  return {
    labelColor: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
    subtleLabelColor: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)",
    legendColor: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)",
    tooltipBg: isDark ? "#1a1a24" : "#ffffff",
    tooltipBorder: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
    tooltipText: isDark ? "#ffffff" : "#111111",
    tooltipMuted: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
    cursorFill: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.04)",
  };
}

function CustomTooltip({ active, payload, label, colors }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number }>;
  label?: string;
  colors: ReturnType<typeof useChartColors>;
}) {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: colors.tooltipBg, border: `1px solid ${colors.tooltipBorder}` }}
        className="rounded-xl px-4 py-3 shadow-xl">
        {label && <p style={{ color: colors.tooltipMuted }} className="text-xs mb-1">{label}</p>}
        {payload.map((p, i) => (
          <p key={i} style={{ color: colors.tooltipText }} className="text-sm font-semibold">
            {p.name}: {typeof p.value === "number" && p.value > 100 ? formatNumber(p.value) : `${p.value}%`}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export function ContentTypeChart({ report }: Props) {
  const colors = useChartColors();
  const data = report.contentStats.map((cs) => ({
    name: cs.type.charAt(0) + cs.type.slice(1).toLowerCase(),
    value: cs.viewsPct,
  }));

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="font-display font-semibold text-white mb-1">Views by Content Type</h3>
      <p className="text-white/40 text-xs mb-6">Distribusi views per jenis konten</p>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS_CONTENT[index % COLORS_CONTENT.length]} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip content={(props) => <CustomTooltip {...props} colors={colors} />} />
          <Legend
            formatter={(value) => <span style={{ color: colors.legendColor }} className="text-xs">{value}</span>}
            iconType="circle"
            iconSize={8}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function InteractionChart({ report }: Props) {
  const colors = useChartColors();
  const m = report.metrics;
  if (!m) return null;

  const data = [
    { name: "Likes", value: m.likes },
    { name: "Reposts", value: m.reposts },
    { name: "Shares", value: m.shares },
    { name: "Saves", value: m.saves },
    { name: "Comments", value: m.comments },
  ].sort((a, b) => b.value - a.value);

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="font-display font-semibold text-white mb-1">Breakdown Interaksi</h3>
      <p className="text-white/40 text-xs mb-6">Reels interactions</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
          <XAxis type="number" tick={{ fill: colors.subtleLabelColor, fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="name" tick={{ fill: colors.labelColor, fontSize: 12 }} axisLine={false} tickLine={false} width={70} />
          <Tooltip content={(props) => <CustomTooltip {...props} colors={colors} />} cursor={{ fill: colors.cursorFill }} />
          <Bar dataKey="value" fill="#f97316" radius={[0, 6, 6, 0]} name="Jumlah" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function AudienceAgeChart({ report }: Props) {
  const colors = useChartColors();
  const a = report.audienceData;
  if (!a) return null;

  const data = [
    { age: "13-17", pct: a.age13to17 },
    { age: "18-24", pct: a.age18to24 },
    { age: "25-34", pct: a.age25to34 },
    { age: "35-44", pct: a.age35to44 },
    { age: "45-54", pct: a.age45to54 },
    { age: "55-64", pct: a.age55to64 },
    { age: "65+", pct: a.age65plus },
  ];

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="font-display font-semibold text-white mb-1">Rentang Usia Followers</h3>
      <p className="text-white/40 text-xs mb-6">Distribusi usia audiens</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ bottom: 0 }}>
          <XAxis dataKey="age" tick={{ fill: colors.labelColor, fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: colors.subtleLabelColor, fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
          <Tooltip content={(props) => <CustomTooltip {...props} colors={colors} />} cursor={{ fill: colors.cursorFill }} />
          <Bar dataKey="pct" name="%" fill="#6366f1" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function GenderChart({ report }: Props) {
  const colors = useChartColors();
  const a = report.audienceData;
  if (!a) return null;

  const data = [
    { name: "Pria", value: a.genderMen },
    { name: "Wanita", value: a.genderWomen },
  ];

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="font-display font-semibold text-white mb-1">Gender Followers</h3>
      <p className="text-white/40 text-xs mb-6">Distribusi gender audiens</p>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS_GENDER[index]} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip content={(props) => <CustomTooltip {...props} colors={colors} />} />
          <Legend
            formatter={(value) => <span style={{ color: colors.legendColor }} className="text-xs">{value}</span>}
            iconType="circle"
            iconSize={8}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}