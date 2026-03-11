"use client";
import { useState } from "react";
import type { PostInsightData } from "@/types";
import { formatNumber } from "@/lib/utils";

interface Props {
  posts: PostInsightData[];
}

function getInstagramThumbnail(permalink: string): string {
  // Extract shortcode from permalink
  const match = permalink.match(/\/(p|reel|tv)\/([A-Za-z0-9_-]+)/);
  if (!match) return "";
  const shortcode = match[2];
  return `https://www.instagram.com/p/${shortcode}/media/?size=m`;
}

function PostCard({ post }: { post: PostInsightData }) {
  const [imgError, setImgError] = useState(false);
  const thumbnail = post.permalink ? getInstagramThumbnail(post.permalink) : "";

  const typeColors: Record<string, string> = {
    REELS: "bg-orange-500/20 text-orange-400",
    STORIES: "bg-pink-500/20 text-pink-400",
    POSTS: "bg-indigo-500/20 text-indigo-400",
    VIDEOS: "bg-teal-500/20 text-teal-400",
  };

  return (
    <div className="glass rounded-2xl overflow-hidden flex flex-col">
      {/* Thumbnail */}
      <div className="relative bg-white/5 aspect-square overflow-hidden">
        {thumbnail && !imgError ? (
          <img
            src={thumbnail}
            alt="thumbnail"
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-10 h-10 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {/* Type badge */}
        <div className="absolute top-2 left-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColors[post.type] ?? "bg-white/10 text-white/50"}`}>
            {post.type}
          </span>
        </div>
        {/* Views overlay */}
        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1">
          <p className="text-white text-xs font-bold">{formatNumber(post.views)}</p>
          <p className="text-white/50 text-[10px]">views</p>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex-1 flex flex-col gap-3">
        {/* Caption */}
        {post.caption && (
          <p className="text-white/60 text-xs line-clamp-2 leading-relaxed">{post.caption}</p>
        )}

        {/* Date */}
        {post.publishedAt && (
          <p className="text-white/30 text-xs">
            {new Date(post.publishedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        )}

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
            href={post.permalink}
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

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h3 className="font-display font-semibold text-white">Per Postingan</h3>
          <p className="text-white/40 text-xs mt-0.5">{posts.length} konten · dari Business Suite</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Filter type */}
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
          {/* Sort */}
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