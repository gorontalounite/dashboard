"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PostInsightData } from "@/types";

interface Props {
  post: PostInsightData;
}

export function PostEditForm({ post }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    viewsFollowersPct: post.viewsFollowersPct?.toString() ?? "",
    viewsNonFollowersPct: post.viewsNonFollowersPct?.toString() ?? "",
    reposts: post.reposts?.toString() ?? "",
    skipRate: post.skipRate?.toString() ?? "",
    avgSkipRate: post.avgSkipRate?.toString() ?? "",
    watchTime: post.watchTime ?? "",
    avgWatchTime: post.avgWatchTime ?? "",
    sourceReelsTab: post.sourceReelsTab?.toString() ?? "",
    sourceFeed: post.sourceFeed?.toString() ?? "",
    sourceStories: post.sourceStories?.toString() ?? "",
    sourceExplore: post.sourceExplore?.toString() ?? "",
    sourceProfile: post.sourceProfile?.toString() ?? "",
    sourceOther: post.sourceOther?.toString() ?? "",
    sourceFromHome: post.sourceFromHome?.toString() ?? "",
    sourceFromProfile: post.sourceFromProfile?.toString() ?? "",
    sourceFromOther: post.sourceFromOther?.toString() ?? "",
    impressions: post.impressions?.toString() ?? "",
    tapsForward: post.tapsForward?.toString() ?? "",
    tapsBack: post.tapsBack?.toString() ?? "",
    exits: post.exits?.toString() ?? "",
    replies: post.replies?.toString() ?? "",
  });

  const set = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  async function handleSave() {
    setSaving(true);
    const payload: Record<string, number | string | null> = {};
    const floatFields = ["viewsFollowersPct","viewsNonFollowersPct","skipRate","avgSkipRate","sourceReelsTab","sourceFeed","sourceStories","sourceExplore","sourceProfile","sourceOther","sourceFromHome","sourceFromProfile","sourceFromOther"];
    const intFields = ["reposts","impressions","tapsForward","tapsBack","exits","replies"];
    const strFields = ["watchTime","avgWatchTime"];
    floatFields.forEach((k) => { payload[k] = form[k as keyof typeof form] !== "" ? parseFloat(form[k as keyof typeof form]) : null; });
    intFields.forEach((k) => { payload[k] = form[k as keyof typeof form] !== "" ? parseInt(form[k as keyof typeof form]) : null; });
    strFields.forEach((k) => { payload[k] = form[k as keyof typeof form] !== "" ? form[k as keyof typeof form] : null; });
    await fetch("/api/posts/" + post.id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    router.push("/dashboard/posts/" + post.id);
    router.refresh();
  }

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500/50 placeholder-white/20";
  const labelClass = "text-white/50 text-xs uppercase tracking-wider mb-1.5 block";
  const isReels = post.type === "REELS";
  const isPosts = post.type === "POSTS";
  const isStories = post.type === "STORIES";

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-6">
        <h3 className="font-display font-semibold text-white mb-4">Views Breakdown</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Followers %</label>
            <input type="number" step="0.1" placeholder="52.6" className={inputClass} value={form.viewsFollowersPct} onChange={(e) => set("viewsFollowersPct", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Non-followers %</label>
            <input type="number" step="0.1" placeholder="47.4" className={inputClass} value={form.viewsNonFollowersPct} onChange={(e) => set("viewsNonFollowersPct", e.target.value)} />
          </div>
        </div>
        <div className="mt-4">
          <label className={labelClass}>Reposts</label>
          <input type="number" placeholder="6" className={inputClass} value={form.reposts} onChange={(e) => set("reposts", e.target.value)} />
        </div>
      </div>

      {isReels && (
        <>
          <div className="glass rounded-2xl p-6">
            <h3 className="font-display font-semibold text-white mb-4">Top Sources of Views</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: "sourceFeed", label: "Feed %" },
                { key: "sourceStories", label: "Stories %" },
                { key: "sourceReelsTab", label: "Reels Tab %" },
                { key: "sourceExplore", label: "Explore %" },
                { key: "sourceProfile", label: "Profile %" },
                { key: "sourceOther", label: "Other %" },
              ].map((f) => (
                <div key={f.key}>
                  <label className={labelClass}>{f.label}</label>
                  <input type="number" step="0.1" placeholder="64.2" className={inputClass} value={form[f.key as keyof typeof form]} onChange={(e) => set(f.key, e.target.value)} />
                </div>
              ))}
            </div>
          </div>
          <div className="glass rounded-2xl p-6">
            <h3 className="font-display font-semibold text-white mb-4">Retention & Watch Time</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Skip Rate %</label>
                <input type="number" step="0.1" placeholder="55.0" className={inputClass} value={form.skipRate} onChange={(e) => set("skipRate", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Typical Skip Rate %</label>
                <input type="number" step="0.1" placeholder="61.5" className={inputClass} value={form.avgSkipRate} onChange={(e) => set("avgSkipRate", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Watch Time</label>
                <input type="text" placeholder="1d 8h 20m 8s" className={inputClass} value={form.watchTime} onChange={(e) => set("watchTime", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Avg Watch Time</label>
                <input type="text" placeholder="16sec" className={inputClass} value={form.avgWatchTime} onChange={(e) => set("avgWatchTime", e.target.value)} />
              </div>
            </div>
          </div>
        </>
      )}

      {isPosts && (
        <div className="glass rounded-2xl p-6">
          <h3 className="font-display font-semibold text-white mb-4">Top Sources of Views</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: "sourceFromHome", label: "From Home %" },
              { key: "sourceFromProfile", label: "From Profile %" },
              { key: "sourceFromOther", label: "From Other %" },
            ].map((f) => (
              <div key={f.key}>
                <label className={labelClass}>{f.label}</label>
                <input type="number" step="0.1" placeholder="87.5" className={inputClass} value={form[f.key as keyof typeof form]} onChange={(e) => set(f.key, e.target.value)} />
              </div>
            ))}
          </div>
        </div>
      )}

      {isStories && (
        <div className="glass rounded-2xl p-6">
          <h3 className="font-display font-semibold text-white mb-4">Stories Detail</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: "impressions", label: "Impressions" },
              { key: "tapsForward", label: "Taps Forward" },
              { key: "tapsBack", label: "Taps Back" },
              { key: "exits", label: "Exits" },
              { key: "replies", label: "Replies" },
            ].map((f) => (
              <div key={f.key}>
                <label className={labelClass}>{f.label}</label>
                <input type="number" placeholder="100" className={inputClass} value={form[f.key as keyof typeof form]} onChange={(e) => set(f.key, e.target.value)} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={handleSave} disabled={saving} className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold py-3.5 rounded-2xl transition-all disabled:opacity-50">
          {saving ? "Menyimpan..." : "Simpan"}
        </button>
        <button onClick={() => router.back()} className="px-6 py-3.5 rounded-2xl border border-white/10 text-white/50 hover:text-white/80 hover:bg-white/5 transition-all">
          Batal
        </button>
      </div>
    </div>
  );
}
