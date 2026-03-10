// src/components/ReportCharts.tsx
"use client";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import type { ReportWithData } from "@/types";
import { formatNumber } from "@/lib/utils";

const COLORS_CONTENT = ["#f97316", "#ec4899", "#6366f1", "#14b8a6"];
const COLORS_GENDER = ["#6366f1", "#ec4899"];

interface Props {
  report: ReportWithData;
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1a24] border border-white/10 rounded-xl px-4 py-3 shadow-xl">
        {label && <p className="text-white/50 text-xs mb-1">{label}</p>}
        {payload.map((p, i) => (
          <p key={i} className="text-white text-sm font-semibold">
            {p.name}: {typeof p.value === "number" && p.value > 100 ? formatNumber(p.value) : `${p.value}%`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function ContentTypeChart({ report }: Props) {
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
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => <span className="text-white/60 text-xs">{value}</span>}
            iconType="circle"
            iconSize={8}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function InteractionChart({ report }: Props) {
  const m = report.metrics;
  if (!m) return null;

  const data = [
    { name: "Likes", value: m.likes },
    { name: "Shares", value: m.shares },
    { name: "Saves", value: m.saves },
    { name: "Reposts", value: m.reposts },
    { name: "Comments", value: m.comments },
  ].sort((a, b) => b.value - a.value);

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="font-display font-semibold text-white mb-1">Breakdown Interaksi</h3>
      <p className="text-white/40 text-xs mb-6">Reels interactions</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
          <XAxis type="number" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="name" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} axisLine={false} tickLine={false} width={70} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
          <Bar dataKey="value" fill="#f97316" radius={[0, 6, 6, 0]} name="Jumlah" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function AudienceAgeChart({ report }: Props) {
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
          <XAxis dataKey="age" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
          <Bar dataKey="pct" name="%" fill="#6366f1" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function GenderChart({ report }: Props) {
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
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => <span className="text-white/60 text-xs">{value}</span>}
            iconType="circle"
            iconSize={8}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
