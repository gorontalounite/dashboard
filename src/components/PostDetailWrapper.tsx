"use client";
import { useRef } from "react";
import Link from "next/link";
import type { PostInsightData } from "@/types";
import { formatNumber } from "@/lib/utils";

interface Props {
  post: PostInsightData & { report: { title: string; accountName: string } };
}

export function PostDetailWrapper({ post }: Props) {
  const printRef = useRef<HTMLDivElement>(null);

  const TYPE_COLOR: Record<string, string> = {
    REELS: "from-orange-500/20 to-pink-500/20",
    STORIES: "from-pink-500/20 to-purple-500/20",
    POSTS: "from-indigo-500/20 to-blue-500/20",
    VIDEOS: "from-teal-500/20 to-cyan-500/20",
  };

  const TYPE_ACCENT: Record<string, string> = {
    REELS: "text-orange-400",
    STORIES: "text-pink-400",
    POSTS: "text-indigo-400",
    VIDEOS: "text-teal-400",
  };

  const gradient = TYPE_COLOR[post.type] ?? TYPE_COLOR.POSTS;
  const accent = TYPE_ACCENT[post.type] ?? TYPE_ACCENT.POSTS;
  const engagement = post.likes + post.comments + post.saves + post.shares;
  const engagementRate = post.reach > 0 ? ((engagement / post.reach) * 100).toFixed(1) : "0";

  const stats = [
    { label: "Views", value: post.views, icon: "👁" },
    { label: "Reach", value: post.reach, icon: "📡" },
    { label: "Likes", value: post.likes, icon: "❤️" },
    { label: "Comments", value: post.comments, icon: "💬" },
    { label: "Saves", value: post.saves, icon: "🔖" },
    { label: "Shares", value: post.shares, icon: "↗️" },
    { label: "Follows", value: post.follows, icon: "➕" },
    { label: "Duration", value: post.duration, icon: "⏱", suffix: "s" },
  ];

  async function handleExportPDF() {
    const { default: jsPDF } = await import("jspdf");
    const { default: html2canvas } = await import("html2canvas");
    if (!printRef.current) return;
    const canvas = await html2canvas(printRef.current, {
      scale: 2,
      backgroundColor: "#0a0a0f",
      useCORS: true,
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    let position = 0;
    const pageHeight = pdf.internal.pageSize.getHeight();
    while (position < pdfHeight) {
      pdf.addImage(imgData, "PNG", 0, -position, pdfWidth, pdfHeight);
      position += pageHeight;
      if (position < pdfHeight) pdf.addPage();
    }
    pdf.save(post.report.accountName + "-" + post.type + ".pdf");
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link
          href={"/dashboard/reports/" + post.reportId}
          className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kembali ke Report
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href={"/dashboard/posts/" + post.id + "/edit"}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm px-4 py-2 rounded-xl transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </Link>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm px-4 py-2 rounded-xl transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export PDF
          </button>
        </div>
      </div>

      <div ref={printRef} className="space-y-6">
        <div className={"glass rounded-2xl overflow-hidden"}>
          <div className={"bg-gradient-to-br " + gradient + " p-6"}>
            <div className="flex items-center justify-between mb-4">
              <span className={"text-xs font-semibold px-3 py-1 rounded-full bg-white/10 " + accent}>
                {post.type}
              </span>
              {post.publishedAt && (
                <span className="text-white/40 text-xs">
                  {new Date(post.publishedAt).toLocaleDateString("id-ID", {
                    day: "numeric", month: "long", year: "numeric",
                    hour: "2-digit", minute: "2-digit"
                  })}
                </span>
              )}
            </div>
            <div className="mb-4">
              <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Total Views</p>
              <p className={"font-display text-5xl font-bold " + accent}>{formatNumber(post.views)}</p>
            </div>
            {post.caption && (
              <p className="text-white/70 text-sm leading-relaxed">{post.caption}</p>
            )}
          </div>
          <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between">
            <div>
              <p className="text-white/40 text-xs uppercase tracking-wider">Engagement Rate</p>
              <p className="text-white font-display text-2xl font-bold mt-0.5">{engagementRate}%</p>
            </div>
            <div className="text-right">
              <p className="text-white/40 text-xs uppercase tracking-wider">Total Engagement</p>
              <p className="text-white font-display text-2xl font-bold mt-0.5">{formatNumber(engagement)}</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <h3 className="font-display font-semibold text-white mb-4">Detail Insight</h3>
          <div className="grid grid-cols-2 gap-3">
            {stats.map((s) => (
              <div key={s.label} className="bg-white/3 rounded-xl p-4 flex items-center gap-3">
                <span className="text-2xl">{s.icon}</span>
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-wider">{s.label}</p>
                  <p className="text-white font-display text-xl font-bold">
                    {formatNumber(s.value)}{s.suffix ?? ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {(post.viewsFollowersPct != null || post.skipRate != null || post.sourceFeed != null || post.impressions != null) && (
          <div className="glass rounded-2xl p-6">
            <h3 className="font-display font-semibold text-white mb-4">Detail Tambahan</h3>
            <div className="grid grid-cols-2 gap-3">
              {post.viewsFollowersPct != null && (
                <div className="bg-white/3 rounded-xl p-4">
                  <p className="text-white/40 text-xs uppercase tracking-wider">Views Followers</p>
                  <p className="text-white font-display text-xl font-bold">{post.viewsFollowersPct}%</p>
                </div>
              )}
              {post.viewsNonFollowersPct != null && (
                <div className="bg-white/3 rounded-xl p-4">
                  <p className="text-white/40 text-xs uppercase tracking-wider">Views Non-followers</p>
                  <p className="text-white font-display text-xl font-bold">{post.viewsNonFollowersPct}%</p>
                </div>
              )}
              {post.reposts != null && (
                <div className="bg-white/3 rounded-xl p-4">
                  <p className="text-white/40 text-xs uppercase tracking-wider">Reposts</p>
                  <p className="text-white font-display text-xl font-bold">{formatNumber(post.reposts)}</p>
                </div>
              )}
              {post.skipRate != null && (
                <div className="bg-white/3 rounded-xl p-4">
                  <p className="text-white/40 text-xs uppercase tracking-wider">Skip Rate</p>
                  <p className="text-white font-display text-xl font-bold">{post.skipRate}%</p>
                </div>
              )}
              {post.avgSkipRate != null && (
                <div className="bg-white/3 rounded-xl p-4">
                  <p className="text-white/40 text-xs uppercase tracking-wider">Typical Skip Rate</p>
                  <p className="text-white font-display text-xl font-bold">{post.avgSkipRate}%</p>
                </div>
              )}
              {post.watchTime != null && (
                <div className="bg-white/3 rounded-xl p-4">
                  <p className="text-white/40 text-xs uppercase tracking-wider">Watch Time</p>
                  <p className="text-white font-display text-xl font-bold">{post.watchTime}</p>
                </div>
              )}
              {post.avgWatchTime != null && (
                <div className="bg-white/3 rounded-xl p-4">
                  <p className="text-white/40 text-xs uppercase tracking-wider">Avg Watch Time</p>
                  <p className="text-white font-display text-xl font-bold">{post.avgWatchTime}</p>
                </div>
              )}
              {post.sourceFeed != null && (
                <div className="bg-white/3 rounded-xl p-4">
                  <p className="text-white/40 text-xs uppercase tracking-wider">From Feed</p>
                  <p className="text-white font-display text-xl font-bold">{post.sourceFeed}%</p>
                </div>
              )}
              {post.sourceReelsTab != null && (
                <div className="bg-white/3 rounded-xl p-4">
                  <p className="text-white/40 text-xs uppercase tracking-wider">From Reels Tab</p>
                  <p className="text-white font-display text-xl font-bold">{post.sourceReelsTab}%</p>
                </div>
              )}
              {post.sourceStories != null && (
                <div className="bg-white/3 rounded-xl p-4">
                  <p className="text-white/40 text-xs uppercase tracking-wider">From Stories</p>
                  <p className="text-white font-display text-xl font-bold">{post.sourceStories}%</p>
                </div>
              )}
              {post.sourceExplore != null && (
                <div className="bg-white/3 rounded-xl p-4">
                  <p className="text-white/40 text-xs uppercase tracking-wider">From Explore</p>
                  <p className="text-white font-display text-xl font-bold">{post.sourceExplore}%</p>
                </div>
              )}
              {post.sourceProfile != null && (
                <div className="bg-white/3 rounded-xl p-4">
                  <p className="text-white/40 text-xs uppercase tracking-wider">From Profile</p>
                  <p className="text-white font-display text-xl font-bold">{post.sourceProfile}%</p>
                </div>
              )}
              {post.sourceFromHome != null && (
                <div className="bg-white/3 rounded-xl p-4">
                  <p className="text-white/40 text-xs uppercase tracking-wider">From Home</p>
                  <p className="text-white font-display text-xl font-bold">{post.sourceFromHome}%</p>
                </div>
              )}
              {post.impressions != null && (
                <div className="bg-white/3 rounded-xl p-4">
                  <p className="text-white/40 text-xs uppercase tracking-wider">Impressions</p>
                  <p className="text-white font-display text-xl font-bold">{formatNumber(post.impressions)}</p>
                </div>
              )}
              {post.tapsForward != null && (
                <div className="bg-white/3 rounded-xl p-4">
                  <p className="text-white/40 text-xs uppercase tracking-wider">Taps Forward</p>
                  <p className="text-white font-display text-xl font-bold">{formatNumber(post.tapsForward)}</p>
                </div>
              )}
              {post.tapsBack != null && (
                <div className="bg-white/3 rounded-xl p-4">
                  <p className="text-white/40 text-xs uppercase tracking-wider">Taps Back</p>
                  <p className="text-white font-display text-xl font-bold">{formatNumber(post.tapsBack)}</p>
                </div>
              )}
              {post.exits != null && (
                <div className="bg-white/3 rounded-xl p-4">
                  <p className="text-white/40 text-xs uppercase tracking-wider">Exits</p>
                  <p className="text-white font-display text-xl font-bold">{formatNumber(post.exits)}</p>
                </div>
              )}
              {post.replies != null && (
                <div className="bg-white/3 rounded-xl p-4">
                  <p className="text-white/40 text-xs uppercase tracking-wider">Replies</p>
                  <p className="text-white font-display text-xl font-bold">{formatNumber(post.replies)}</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="glass rounded-2xl p-6">
          <h3 className="font-display font-semibold text-white mb-3">Dari Report</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-sm">{post.report.title}</p>
              <p className="text-white/40 text-xs mt-0.5">@{post.report.accountName}</p>
            </div>
            <Link
              href={"/dashboard/reports/" + post.reportId}
              className="text-orange-400 text-xs hover:text-orange-300 transition-colors"
            >
              Lihat Report →
            </Link>
          </div>
        </div>

        {post.permalink && (
          <a
            href={post.permalink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold py-3.5 rounded-2xl transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Lihat di Instagram
          </a>
        )}
      </div>
    </div>
  );
}
