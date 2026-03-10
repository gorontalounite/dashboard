import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatNumber, formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      metrics: {
        select: { views: true, interactions: true, accountsReached: true },
      },
    },
  });

  const totalViews = reports.reduce((acc, r) => acc + (r.metrics?.views ?? 0), 0);
  const totalInteractions = reports.reduce((acc, r) => acc + (r.metrics?.interactions ?? 0), 0);
  const totalReports = await prisma.report.count();

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white">
          Halo, {session?.user?.name?.split(" ")[0] ?? "Admin"} 👋
        </h1>
        <p className="text-white/40 mt-1">Berikut ringkasan semua insight yang telah diinput.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Reports", val: totalReports },
          { label: "Total Views (all)", val: totalViews },
          { label: "Total Interactions", val: totalInteractions },
        ].map((item) => (
          <div key={item.label} className="glass rounded-2xl p-5">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-2">{item.label}</p>
            <p className="font-display text-2xl font-bold text-white">{formatNumber(item.val)}</p>
          </div>
        ))}
      </div>

      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-semibold text-white">Report Terbaru</h2>
          <Link href="/dashboard/reports" className="text-orange-400 text-sm hover:text-orange-300 transition-colors">
            Lihat semua →
          </Link>
        </div>

        {reports.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/30 text-sm">Belum ada report. Mulai dengan input data insight.</p>
            <Link href="/dashboard/input" className="inline-block mt-4 bg-orange-500/10 text-orange-400 border border-orange-500/20 px-4 py-2 rounded-xl text-sm hover:bg-orange-500/20 transition-all">
              + Input Data
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <Link
                key={report.id}
                href={`/dashboard/reports/${report.id}`}
                className="flex items-center gap-4 bg-white/3 hover:bg-white/6 rounded-xl p-4 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-pink-500/20 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">{report.title}</p>
                  <p className="text-white/40 text-xs mt-0.5">
                    @{report.accountName} · {formatDate(report.periodStart.toISOString())} – {formatDate(report.periodEnd.toISOString())}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-white font-display font-bold text-sm">{formatNumber(report.metrics?.views ?? 0)}</p>
                  <p className="text-white/30 text-xs">views</p>
                </div>
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${report.isPublic ? "bg-emerald-400" : "bg-white/20"}`} />
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <Link href="/dashboard/input" className="glass rounded-2xl p-5 hover:bg-white/5 transition-all group">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <p className="text-white font-medium text-sm">Input Data Baru</p>
              <p className="text-white/40 text-xs">Tambah insight periode baru</p>
            </div>
          </div>
        </Link>
        <Link href="/dashboard/compare" className="glass rounded-2xl p-5 hover:bg-white/5 transition-all group">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-medium text-sm">Bandingkan Periode</p>
              <p className="text-white/40 text-xs">Lihat tren antar report</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}