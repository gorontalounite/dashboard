"use client";
import { useState, useEffect, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import type { InputFormData, ContentType } from "@/types";
import { UploadCSV } from "@/components/UploadCSV";

const emptyForm: InputFormData = {
  title: "", accountName: "", periodStart: "", periodEnd: "", isPublic: false,
  views: "", viewsFromAds: "", viewsFollowers: "", viewsNonFollowers: "",
  accountsReached: "", accountsReachedChange: "", interactions: "",
  interactionsFromAds: "", interactionsFollowers: "", interactionsNonFollowers: "",
  likes: "", comments: "", saves: "", shares: "", reposts: "",
  profileVisits: "", profileVisitsChange: "", externalLinkTaps: "",
  externalLinkTapsChange: "", followsGained: "", unfollows: "", netFollowerGrowth: "",
  reelsViewsPct: "", storiesViewsPct: "", postsViewsPct: "",
  reelsInteractionsPct: "", postsInteractionsPct: "", storiesInteractionsPct: "",
  topContent1Caption: "", topContent1Views: "", topContent1Type: "REELS", topContent1Date: "",
  topContent2Caption: "", topContent2Views: "", topContent2Type: "REELS", topContent2Date: "",
  topContent3Caption: "", topContent3Views: "", topContent3Type: "REELS", topContent3Date: "",
  topContent4Caption: "", topContent4Views: "", topContent4Type: "REELS", topContent4Date: "",
  genderMen: "", genderWomen: "",
  age13to17: "", age18to24: "", age25to34: "", age35to44: "",
  age45to54: "", age55to64: "", age65plus: "",
  topCity1: "", topCity1Pct: "", topCity2: "", topCity2Pct: "",
  topCity3: "", topCity3Pct: "", topCity4: "", topCity4Pct: "",
  topCity5: "", topCity5Pct: "",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label-dark">{label}</label>
      {children}
    </div>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="border-b border-white/5 pb-4 mb-6">
      <h2 className="font-display text-base font-semibold text-white">{title}</h2>
      {subtitle && <p className="text-white/40 text-xs mt-0.5">{subtitle}</p>}
    </div>
  );
}

type ApiReport = {
  title: string;
  accountName: string;
  periodStart: string;
  periodEnd: string;
  isPublic: boolean;
  metrics?: {
    views: number; viewsFromAds: number; viewsFollowers: number;
    viewsNonFollowers: number; accountsReached: number; accountsReachedChange: number;
    interactions: number; interactionsFromAds: number; interactionsFollowers: number;
    interactionsNonFollowers: number; likes: number; comments: number;
    saves: number; shares: number; reposts: number; profileVisits: number;
    profileVisitsChange: number; externalLinkTaps: number; externalLinkTapsChange: number;
    followsGained: number; unfollows: number; netFollowerGrowth: number;
  } | null;
  contentStats?: { type: string; viewsPct: number; interactionsPct: number }[];
  topContent?: { rank: number; caption: string | null; views: number; type: string; publishedAt: string | null }[];
  audienceData?: {
    genderMen: number; genderWomen: number;
    age13to17: number; age18to24: number; age25to34: number; age35to44: number;
    age45to54: number; age55to64: number; age65plus: number;
    topCity1: string | null; topCity1Pct: number;
    topCity2: string | null; topCity2Pct: number;
    topCity3: string | null; topCity3Pct: number;
    topCity4: string | null; topCity4Pct: number;
    topCity5: string | null; topCity5Pct: number;
  } | null;
};

export default function EditReportPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [form, setForm] = useState<InputFormData>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadReport() {
      const res = await fetch(`/api/reports/${id}`);
      const data = await res.json() as ApiReport;

      // Map content stats
      const reels = data.contentStats?.find((c) => c.type === "REELS");
      const stories = data.contentStats?.find((c) => c.type === "STORIES");
      const posts = data.contentStats?.find((c) => c.type === "POSTS");

      // Map top content
      const tc = (n: number) => data.topContent?.find((c) => c.rank === n);

      setForm({
        title: data.title,
        accountName: data.accountName,
        periodStart: data.periodStart.split("T")[0],
        periodEnd: data.periodEnd.split("T")[0],
        isPublic: data.isPublic,
        views: String(data.metrics?.views ?? ""),
        viewsFromAds: String(data.metrics?.viewsFromAds ?? ""),
        viewsFollowers: String(data.metrics?.viewsFollowers ?? ""),
        viewsNonFollowers: String(data.metrics?.viewsNonFollowers ?? ""),
        accountsReached: String(data.metrics?.accountsReached ?? ""),
        accountsReachedChange: String(data.metrics?.accountsReachedChange ?? ""),
        interactions: String(data.metrics?.interactions ?? ""),
        interactionsFromAds: String(data.metrics?.interactionsFromAds ?? ""),
        interactionsFollowers: String(data.metrics?.interactionsFollowers ?? ""),
        interactionsNonFollowers: String(data.metrics?.interactionsNonFollowers ?? ""),
        likes: String(data.metrics?.likes ?? ""),
        comments: String(data.metrics?.comments ?? ""),
        saves: String(data.metrics?.saves ?? ""),
        shares: String(data.metrics?.shares ?? ""),
        reposts: String(data.metrics?.reposts ?? ""),
        profileVisits: String(data.metrics?.profileVisits ?? ""),
        profileVisitsChange: String(data.metrics?.profileVisitsChange ?? ""),
        externalLinkTaps: String(data.metrics?.externalLinkTaps ?? ""),
        externalLinkTapsChange: String(data.metrics?.externalLinkTapsChange ?? ""),
        followsGained: String(data.metrics?.followsGained ?? ""),
        unfollows: String(data.metrics?.unfollows ?? ""),
        netFollowerGrowth: String(data.metrics?.netFollowerGrowth ?? ""),
        reelsViewsPct: String(reels?.viewsPct ?? ""),
        storiesViewsPct: String(stories?.viewsPct ?? ""),
        postsViewsPct: String(posts?.viewsPct ?? ""),
        reelsInteractionsPct: String(reels?.interactionsPct ?? ""),
        postsInteractionsPct: String(posts?.interactionsPct ?? ""),
        storiesInteractionsPct: String(stories?.interactionsPct ?? ""),
        topContent1Caption: tc(1)?.caption ?? "",
        topContent1Views: String(tc(1)?.views ?? ""),
        topContent1Type: (tc(1)?.type as ContentType) ?? "REELS",
        topContent1Date: tc(1)?.publishedAt?.split("T")[0] ?? "",
        topContent2Caption: tc(2)?.caption ?? "",
        topContent2Views: String(tc(2)?.views ?? ""),
        topContent2Type: (tc(2)?.type as ContentType) ?? "REELS",
        topContent2Date: tc(2)?.publishedAt?.split("T")[0] ?? "",
        topContent3Caption: tc(3)?.caption ?? "",
        topContent3Views: String(tc(3)?.views ?? ""),
        topContent3Type: (tc(3)?.type as ContentType) ?? "REELS",
        topContent3Date: tc(3)?.publishedAt?.split("T")[0] ?? "",
        topContent4Caption: tc(4)?.caption ?? "",
        topContent4Views: String(tc(4)?.views ?? ""),
        topContent4Type: (tc(4)?.type as ContentType) ?? "REELS",
        topContent4Date: tc(4)?.publishedAt?.split("T")[0] ?? "",
        genderMen: String(data.audienceData?.genderMen ?? ""),
        genderWomen: String(data.audienceData?.genderWomen ?? ""),
        age13to17: String(data.audienceData?.age13to17 ?? ""),
        age18to24: String(data.audienceData?.age18to24 ?? ""),
        age25to34: String(data.audienceData?.age25to34 ?? ""),
        age35to44: String(data.audienceData?.age35to44 ?? ""),
        age45to54: String(data.audienceData?.age45to54 ?? ""),
        age55to64: String(data.audienceData?.age55to64 ?? ""),
        age65plus: String(data.audienceData?.age65plus ?? ""),
        topCity1: data.audienceData?.topCity1 ?? "",
        topCity1Pct: String(data.audienceData?.topCity1Pct ?? ""),
        topCity2: data.audienceData?.topCity2 ?? "",
        topCity2Pct: String(data.audienceData?.topCity2Pct ?? ""),
        topCity3: data.audienceData?.topCity3 ?? "",
        topCity3Pct: String(data.audienceData?.topCity3Pct ?? ""),
        topCity4: data.audienceData?.topCity4 ?? "",
        topCity4Pct: String(data.audienceData?.topCity4Pct ?? ""),
        topCity5: data.audienceData?.topCity5 ?? "",
        topCity5Pct: String(data.audienceData?.topCity5Pct ?? ""),
      });
      setLoading(false);
    }
    void loadReport();
  }, [id]);

  function setField<K extends keyof InputFormData>(key: K, value: InputFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function input(key: keyof InputFormData, type = "text", placeholder = "") {
    return (
      <input
        type={type}
        className="input-dark"
        placeholder={placeholder}
        value={form[key] as string}
        onChange={(e) => setField(key, e.target.value as InputFormData[typeof key])}
      />
    );
  }

  function selectType(key: keyof InputFormData) {
    return (
      <select
        className="input-dark"
        value={form[key] as string}
        onChange={(e) => setField(key, e.target.value as ContentType)}
      >
        <option value="REELS">Reels</option>
        <option value="STORIES">Stories</option>
        <option value="POSTS">Posts</option>
        <option value="VIDEOS">Videos</option>
      </select>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/reports/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Gagal menyimpan perubahan");
      router.push(`/dashboard/reports/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl">
        <div className="glass rounded-2xl h-32 animate-pulse mb-4" />
        <div className="glass rounded-2xl h-64 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Edit Report</h1>
          <p className="text-white/40 text-sm mt-1">Perbarui data insight yang sudah tersimpan.</p>
        </div>
        <button
          onClick={() => router.back()}
          className="text-white/40 hover:text-white/70 text-sm transition-colors"
        >
          ← Kembali
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Info Dasar */}
        <div className="glass rounded-2xl p-6">
          <SectionTitle title="Informasi Dasar" />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Judul Report">{input("title", "text", "e.g. Q1 2026")}</Field>
            <Field label="Nama Akun">{input("accountName", "text", "gorontalo.unite")}</Field>
            <Field label="Periode Mulai">{input("periodStart", "date")}</Field>
            <Field label="Periode Selesai">{input("periodEnd", "date")}</Field>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <input type="checkbox" id="isPublic" checked={form.isPublic}
              onChange={(e) => setField("isPublic", e.target.checked)}
              className="w-4 h-4 accent-orange-500" />
            <label htmlFor="isPublic" className="text-white/60 text-sm">Buat report publik</label>
          </div>
        </div>

        {/* Views */}
        <div className="glass rounded-2xl p-6">
          <SectionTitle title="Views" />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Total Views">{input("views", "number")}</Field>
            <Field label="% dari Iklan">{input("viewsFromAds", "number")}</Field>
            <Field label="% dari Followers">{input("viewsFollowers", "number")}</Field>
            <Field label="% dari Non-followers">{input("viewsNonFollowers", "number")}</Field>
            <Field label="Accounts Reached">{input("accountsReached", "number")}</Field>
            <Field label="Reached Change (%)">{input("accountsReachedChange", "number")}</Field>
          </div>
        </div>

        {/* Interactions */}
        <div className="glass rounded-2xl p-6">
          <SectionTitle title="Interactions" />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Total Interactions">{input("interactions", "number")}</Field>
            <Field label="% dari Iklan">{input("interactionsFromAds", "number")}</Field>
            <Field label="% Followers">{input("interactionsFollowers", "number")}</Field>
            <Field label="% Non-followers">{input("interactionsNonFollowers", "number")}</Field>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 mt-4">
            <Field label="Likes">{input("likes", "number")}</Field>
            <Field label="Comments">{input("comments", "number")}</Field>
            <Field label="Saves">{input("saves", "number")}</Field>
            <Field label="Shares">{input("shares", "number")}</Field>
            <Field label="Reposts">{input("reposts", "number")}</Field>
          </div>
        </div>

        {/* Content Stats */}
        <div className="glass rounded-2xl p-6">
          <SectionTitle title="Views by Content Type (%)" />
          <div className="grid grid-cols-3 gap-4">
            <Field label="Reels %">{input("reelsViewsPct", "number")}</Field>
            <Field label="Stories %">{input("storiesViewsPct", "number")}</Field>
            <Field label="Posts %">{input("postsViewsPct", "number")}</Field>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <Field label="Reels Interaction %">{input("reelsInteractionsPct", "number")}</Field>
            <Field label="Posts Interaction %">{input("postsInteractionsPct", "number")}</Field>
            <Field label="Stories Interaction %">{input("storiesInteractionsPct", "number")}</Field>
          </div>
        </div>

        {/* Top Content */}
        <div className="glass rounded-2xl p-6">
          <SectionTitle title="Top Content" />
          <div className="space-y-4">
            {([1, 2, 3, 4] as const).map((n) => (
              <div key={n} className="bg-white/3 rounded-xl p-4">
                <p className="text-orange-400 text-xs font-semibold mb-3">#{n}</p>
                <div className="grid grid-cols-4 gap-3">
                  <div className="col-span-2">
                    <Field label="Caption">{input(`topContent${n}Caption` as keyof InputFormData, "text")}</Field>
                  </div>
                  <Field label="Views">{input(`topContent${n}Views` as keyof InputFormData, "number")}</Field>
                  <Field label="Tipe">{selectType(`topContent${n}Type` as keyof InputFormData)}</Field>
                  <div className="col-span-2">
                    <Field label="Tanggal">{input(`topContent${n}Date` as keyof InputFormData, "date")}</Field>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Profile Activity */}
        <div className="glass rounded-2xl p-6">
          <SectionTitle title="Profile Activity" />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Profile Visits">{input("profileVisits", "number")}</Field>
            <Field label="Visits Change (%)">{input("profileVisitsChange", "number")}</Field>
            <Field label="External Link Taps">{input("externalLinkTaps", "number")}</Field>
            <Field label="Link Taps Change (%)">{input("externalLinkTapsChange", "number")}</Field>
          </div>
        </div>

        {/* Follower Growth */}
        <div className="glass rounded-2xl p-6">
          <SectionTitle title="Follower Growth" />
          <div className="grid grid-cols-3 gap-4">
            <Field label="New Follows">{input("followsGained", "number")}</Field>
            <Field label="Unfollows">{input("unfollows", "number")}</Field>
            <Field label="Net Growth">{input("netFollowerGrowth", "number")}</Field>
          </div>
        </div>

        {/* Audience */}
        <div className="glass rounded-2xl p-6">
          <SectionTitle title="Audience Data" />
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Field label="Pria (%)">{input("genderMen", "number")}</Field>
            <Field label="Wanita (%)">{input("genderWomen", "number")}</Field>
          </div>
          <div className="grid grid-cols-4 gap-3 mb-6">
            {(["13to17","18to24","25to34","35to44","45to54","55to64","65plus"] as const).map((r) => (
              <Field key={r} label={`${r.replace("to","-").replace("plus","+")}%`}>
                {input(`age${r}` as keyof InputFormData, "number")}
              </Field>
            ))}
          </div>
          <div className="space-y-3">
            {([1,2,3,4,5] as const).map((n) => (
              <div key={n} className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <Field label={`Kota ${n}`}>{input(`topCity${n}` as keyof InputFormData, "text")}</Field>
                </div>
                <Field label="% Followers">{input(`topCity${n}Pct` as keyof InputFormData, "number")}</Field>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <UploadCSV reportId={id} />
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-gradient-to-r from-orange-500 to-pink-600 text-white font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3.5 rounded-xl border border-white/10 text-white/50 hover:text-white/80 hover:bg-white/5 transition-all"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}