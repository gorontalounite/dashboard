// src/app/dashboard/reports/page.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { formatNumber, formatDate } from "@/lib/utils";
import type { ReportListItem } from "@/types";

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    const res = await fetch("/api/reports");
    const data = await res.json() as ReportListItem[];
    setReports(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchReports();
  }, [fetchReports]);

  async function togglePublic(id: string, current: boolean) {
    await fetch(`/api/reports/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublic: !current }),
    });
    void fetchReports();
  }

  async function deleteReport(id: string) {
    if (!confirm("Hapus report ini?")) return;
    await fetch(`/api/reports/${id}`, { method: "DELETE" });
    void fetchReports();
  }

  function copyShareLink(token: string) {
    const url = `${window.location.origin}/report/${token}`;
    void navigator.clipboard.writeText(url);
    setCopied(token);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Reports</h1>
          <p className="text-white/40 text-sm mt-1">Kelola semua laporan insight Instagram.</p>
        </div>
        <Link
          href="/dashboard/input"
          className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-pink-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Input Baru
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass rounded-2xl h-24 animate-pulse" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <p className="text-white/30">Belum ada report. Mulai input data insight pertama Anda.</p>
          <Link href="/dashboard/input" className="inline-block mt-4 text-orange-400 text-sm hover:text-orange-300">
            → Input Data Sekarang
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <div key={report.id} className="glass rounded-2xl p-5 flex items-center gap-4">
              {/* Status dot */}
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${report.isPublic ? "bg-emerald-400" : "bg-white/20"}`} />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <Link href={`/dashboard/reports/${report.id}`} className="text-white font-medium text-sm hover:text-orange-400 transition-colors">
                  {report.title}
                </Link>
                <p className="text-white/40 text-xs mt-0.5">
                  @{report.accountName} · {formatDate(report.periodStart)} – {formatDate(report.periodEnd)}
                </p>
              </div>

              {/* Metrics */}
              <div className="text-right flex-shrink-0 hidden sm:block">
                <p className="text-white font-display font-bold text-sm">{formatNumber(report.metrics?.views ?? 0)}</p>
                <p className="text-white/30 text-xs">views</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Toggle public */}
                <button
                  onClick={() => togglePublic(report.id, report.isPublic)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                    report.isPublic
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                      : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
                  }`}
                >
                  {report.isPublic ? "Publik" : "Private"}
                </button>

                {/* Copy link */}
                {report.isPublic && (
                  <button
                    onClick={() => copyShareLink(report.shareToken)}
                    className="text-xs px-3 py-1.5 rounded-lg border bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all"
                  >
                    {copied === report.shareToken ? "✓ Copied" : "Copy Link"}
                  </button>
                )}

                {/* View */}
                <Link
                  href={`/dashboard/reports/${report.id}`}
                  className="text-xs px-3 py-1.5 rounded-lg border bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all"
                >
                  View
                </Link>

                {/* Delete */}
                <button
                  onClick={() => deleteReport(report.id)}
                  className="text-xs px-3 py-1.5 rounded-lg border bg-red-500/5 border-red-500/10 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
