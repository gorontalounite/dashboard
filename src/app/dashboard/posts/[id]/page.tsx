import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatNumber } from "@/lib/utils";
import type { ContentType } from "@/types";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const post = await prisma.postInsight.findUnique({
    where: { id },
    include: { report: true },
  });

  if (!post) notFound();

  const engagement = post.likes + post.comments + post.saves + post.shares;
  const engagementRate = post.reach > 0
    ? ((engagement / post.reach) * 100).toFixed(1)
    : "0";

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

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Back button */}
      <Link
        href={"/dashboard/reports/" + post.reportId}
        className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-sm mb-6 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Kembali ke Report
      </Link>

      {/* Header Card */}
      <div className={"glass rounded-2xl overflow-hidden mb-6"}>
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

          {/* Views highlight */}
          <div className="mb-4">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Total Views</p>
            <p className={"font-display text-5xl font-bold " + accent}>{formatNumber(post.views)}</p>
          </div>

          {/* Caption */}
          {post.caption && (
            <p className="text-white/70 text-sm leading-relaxed">{post.caption}</p>
          )}
        </div>

        {/* Engagement rate bar */}
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

      {/* Stats Grid */}
      <div className="glass rounded-2xl p-6 mb-6">
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

      {/* Report info */}
      <div className="glass rounded-2xl p-6 mb-6">
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

      {/* Instagram link */}
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
  );
}
