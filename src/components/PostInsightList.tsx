"use client";
import { useState } from "react";
import type { PostInsightData } from "@/types";
import { formatNumber } from "@/lib/utils";

interface Props {
  posts: PostInsightData[];
}

const TYPE_CONFIG: Record<string, { gradient: string; iconColor: string; label: string }> = {
  REELS: { gradient: "from-orange-500/20 to-pink-500/20", iconColor: "text-orange-400", label: "Reels" },
  STORIES: { gradient: "from-pink-500/20 to-purple-500/20", iconColor: "text-pink-400", label: "Stories" },
  POSTS: { gradient: "from-indigo-500/20 to-blue-500/20", iconColor: "text-indigo-400", label: "Posts" },
  VIDEOS: { gradient: "from-teal-500/20 to-cyan-500/20", iconColor: "text-teal-400", label: "Videos" },
};

const TYPE_BADGE: Record<string, string> = {
  REELS: "bg-orange-500/20 text-orange-400 border-orange-500/20",
  STORIES: "bg-pink-500/20 text-pink-400 border-pink-500/20",
  POSTS: "bg-indigo-500/20 text-indigo-400 border-indigo-500/20",
  VIDEOS: "bg-teal-500/20 text-teal-400 border-teal-500/20",
};

function TypeIcon({ type, className }: { type: string; className?: string }) {
  if (type === "REELS") return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z"/>
    </svg>
  );
  if (type === "STORIES") return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );
  if (type === "POSTS") return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.845v6.31a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}

function PostCard({ post }: { post: PostInsightData }) {
  const config = TYPE_CONFIG[post.type] ?? TYPE_CONFIG.POSTS;
  const badge = TYPE_BADGE[post.type] ?? "bg-white/10 text-white/50 border-white/10";
  const engagementRate = post.reach > 0
    ? (((post.likes + post.comments + post.saves + post.shares) / post.reach) * 100).toFixed(1)
    : "0";

  return (
    <div className="glass rounded-2xl overflow-hidden flex flex-col hover:bg-white/5 transition-all">
      {/* Header visual area */}
      <div className={`relative bg-gradient-to-br ${config.gradient} p-5 flex flex-col gap-3`}>
        {/* Type + Date row */}
        <div className="flex items-center justify-between">
          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${badge}`}>
            {config.label}
          </span>
          {post.publishedAt && (
            <span className="text-white/30 text-xs">
              {new Date(post.publishedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
            </span>
          )}
        </div>

        {/* Icon + Views */}
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0`}>
            <TypeIcon type={post.type} className={`w-6 h-6 ${config.iconColor}`} />
          </div>
          <div>
            <p className="text-white/40 text-xs uppercase tracking-wider">Views</p>
            <p className={`font-display text-2xl font-bold ${config.iconColor}`}>{formatNumber(post.views)}</p>
          </div>
        </div>

        {/* Caption */}
        {post.caption && (
          <p className="text-white/60 text-xs line-clamp-2 leading-relaxed">{post.caption}</p>
        )}
      </div>

      {/* Stats */}
      <div className="p-4 flex-1 flex flex-col gap-3">
        {/* Engagement rate */}
        <div className="flex items-center justify-between bg-white/3 rounded-xl px-3 py-2">
          <span className="text-white/40 text-xs">Engagement Rate</span>
          <span className="text-white font-semibold text-sm">{engagementRate}%</span>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Reach", value: post.reach },
            { label: "Likes", value: post.likes },
            { label: "Comments", value: post.comments },
            { label: "Saves", value: post.saves },
            { label: "Shares", value: post.shares },
            { label: "Follows", value: post.follows },
          ].map((s) => (
            <div key={s.label} className="bg-white/3 rounded-lg p-2 text-center">
              <p className="text-white font-semibold text-xs">{formatNumber(s.value)}</p>
              <p className="text-white/30 text-[10px]">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Link */}
        {post.permalink && (
          <a
            href={post.permalink ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-orange-400 hover:text-orange-300 text-xs transition-colors mt-auto"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Lihat di Instagram
          </a>
        )}
      </div>
    </div>
  );
}

export function PostInsightList({ posts }: Props) {
  const [filter, setFilter] = useState<"ALL" | "REELS" | "POSTS" | "STORIES">("ALL");
  const [sortBy, setSortBy] = useState<"views" | "likes" | "reach">("views");

  const filtered = posts
    .filter((p) => filter === "ALL" || p.type === filter)
    .sort((a, b) => b[sortBy] - a[sortBy]);

  if (posts.length === 0) return null;

  const totalViews = posts.reduce((s, p) => s + p.views, 0);
  const totalEngagement = posts.reduce((s, p) => s + p.likes + p.comments + p.saves + p.shares, 0);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h3 className="font-display font-semibold text-white">Per Postingan</h3>
          <p className="text-white/40 text-xs mt-0.5">
            {posts.length} konten · {formatNumber(totalViews)} total views · {formatNumber(totalEngagement)} total engagement
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {(["ALL", "REELS", "POSTS", "STORIES"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                  filter === t
                    ? "bg-orange-500/10 border-orange-500/30 text-orange-400"
                    : "bg-white/3 border-white/10 text-white/40 hover:text-white/70"
                }`}
              >
                {t === "ALL" ? "Semua" : t}
              </button>
            ))}
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="text-xs bg-white/5 border border-white/10 text-white/50 rounded-lg px-2 py-1.5"
          >
            <option value="views">Views</option>
            <option value="likes">Likes</option>
            <option value="reach">Reach</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
