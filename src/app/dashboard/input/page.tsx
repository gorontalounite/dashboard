// src/app/dashboard/input/page.tsx
"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { UploadCSV } from "@/components/UploadCSV";
import type { InputFormData, ContentType } from "@/types";

const defaultForm: InputFormData = {
  title: "",
  accountName: "",
  periodStart: "",
  periodEnd: "",
  isPublic: false,
  views: "",
  viewsFromAds: "",
  viewsFollowers: "",
  viewsNonFollowers: "",
  accountsReached: "",
  accountsReachedChange: "",
  interactions: "",
  interactionsFromAds: "",
  interactionsFollowers: "",
  interactionsNonFollowers: "",
  likes: "",
  comments: "",
  saves: "",
  shares: "",
  reposts: "",
  profileVisits: "",
  profileVisitsChange: "",
  externalLinkTaps: "",
  externalLinkTapsChange: "",
  followsGained: "",
  unfollows: "",
  netFollowerGrowth: "",
  reelsViewsPct: "",
  storiesViewsPct: "",
  postsViewsPct: "",
  reelsInteractionsPct: "",
  postsInteractionsPct: "",
  storiesInteractionsPct: "",
  topContent1Caption: "",
  topContent1Views: "",
  topContent1Type: "REELS",
  topContent1Date: "",
  topContent2Caption: "",
  topContent2Views: "",
  topContent2Type: "REELS",
  topContent2Date: "",
  topContent3Caption: "",
  topContent3Views: "",
  topContent3Type: "REELS",
  topContent3Date: "",
  topContent4Caption: "",
  topContent4Views: "",
  topContent4Type: "REELS",
  topContent4Date: "",
  genderMen: "",
  genderWomen: "",
  age13to17: "",
  age18to24: "",
  age25to34: "",
  age35to44: "",
  age45to54: "",
  age55to64: "",
  age65plus: "",
  topCity1: "",
  topCity1Pct: "",
  topCity2: "",
  topCity2Pct: "",
  topCity3: "",
  topCity3Pct: "",
  topCity4: "",
  topCity4Pct: "",
  topCity5: "",
  topCity5Pct: "",
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

export default function InputPage() {
  const router = useRouter();
  const [form, setForm] = useState<InputFormData>(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function setField<K extends keyof InputFormData>(key: K, value: InputFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function input(key: keyof InputFormData, type: string = "text", placeholder: string = "") {
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
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Gagal menyimpan data");

      const report = await res.json() as { id: string };
      router.push(`/dashboard/reports/${report.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-white">Input Data Insight</h1>
        <p className="text-white/40 text-sm mt-1">Isi data dari screenshot Instagram Insight Anda.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* Info Dasar */}
        <div className="glass rounded-2xl p-6">
          <SectionTitle title="Informasi Dasar" subtitle="Identitas report dan akun" />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Judul Report">
              {input("title", "text", "e.g. Q1 2026 Gorontalo Unite")}
            </Field>
            <Field label="Nama Akun Instagram">
              {input("accountName", "text", "gorontalo.unite")}
            </Field>
            <Field label="Periode Mulai">
              {input("periodStart", "date")}
            </Field>
            <Field label="Periode Selesai">
              {input("periodEnd", "date")}
            </Field>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <input
              type="checkbox"
              id="isPublic"
              checked={form.isPublic}
              onChange={(e) => setField("isPublic", e.target.checked)}
              className="w-4 h-4 accent-orange-500"
            />
            <label htmlFor="isPublic" className="text-white/60 text-sm">
              Buat report ini publik (bisa diakses via link oleh klien)
            </label>
          </div>
        </div>

        {/* Views */}
        <div className="glass rounded-2xl p-6">
          <SectionTitle title="Views" subtitle="Data dari halaman Views Instagram Insight" />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Total Views">{input("views", "number", "2478141")}</Field>
            <Field label="% Views dari Iklan">{input("viewsFromAds", "number", "1.4")}</Field>
            <Field label="% Views dari Followers">{input("viewsFollowers", "number", "64.2")}</Field>
            <Field label="% Views dari Non-followers">{input("viewsNonFollowers", "number", "35.8")}</Field>
            <Field label="Accounts Reached">{input("accountsReached", "number", "208377")}</Field>
            <Field label="Accounts Reached Change (%)">{input("accountsReachedChange", "number", "-36.3")}</Field>
          </div>
        </div>

        {/* Interactions */}
        <div className="glass rounded-2xl p-6">
          <SectionTitle title="Interactions" subtitle="Data dari halaman Interactions" />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Total Interactions">{input("interactions", "number", "58547")}</Field>
            <Field label="% Interaksi dari Iklan">{input("interactionsFromAds", "number", "0.5")}</Field>
            <Field label="% Interaksi Followers">{input("interactionsFollowers", "number", "48.4")}</Field>
            <Field label="% Interaksi Non-followers">{input("interactionsNonFollowers", "number", "51.6")}</Field>
          </div>
          <p className="text-white/30 text-xs mt-4 mb-3">Breakdown interaksi Reels:</p>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
            <Field label="Likes">{input("likes", "number", "35877")}</Field>
            <Field label="Comments">{input("comments", "number", "510")}</Field>
            <Field label="Saves">{input("saves", "number", "1463")}</Field>
            <Field label="Shares">{input("shares", "number", "2492")}</Field>
            <Field label="Reposts">{input("reposts", "number", "720")}</Field>
          </div>
        </div>

        {/* Content Stats */}
        <div className="glass rounded-2xl p-6">
          <SectionTitle title="Views by Content Type (%)" subtitle="Persentase views per jenis konten" />
          <div className="grid grid-cols-3 gap-4">
            <Field label="Reels Views %">{input("reelsViewsPct", "number", "41.7")}</Field>
            <Field label="Stories Views %">{input("storiesViewsPct", "number", "40.5")}</Field>
            <Field label="Posts Views %">{input("postsViewsPct", "number", "17.9")}</Field>
          </div>
          <p className="text-white/30 text-xs mt-4 mb-3">Interactions by content type (%):</p>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Reels Interaction %">{input("reelsInteractionsPct", "number", "72.1")}</Field>
            <Field label="Posts Interaction %">{input("postsInteractionsPct", "number", "21.4")}</Field>
            <Field label="Stories Interaction %">{input("storiesInteractionsPct", "number", "6.4")}</Field>
          </div>
        </div>

        {/* Top Content */}
        <div className="glass rounded-2xl p-6">
          <SectionTitle title="Top Content" subtitle="4 konten dengan views terbanyak" />
          <div className="space-y-4">
            {([1, 2, 3, 4] as const).map((n) => {
              const captionKey = `topContent${n}Caption` as keyof InputFormData;
              const viewsKey = `topContent${n}Views` as keyof InputFormData;
              const typeKey = `topContent${n}Type` as keyof InputFormData;
              const dateKey = `topContent${n}Date` as keyof InputFormData;
              return (
                <div key={n} className="bg-white/3 rounded-xl p-4">
                  <p className="text-orange-400 text-xs font-semibold mb-3">#{n}</p>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="col-span-2">
                      <Field label="Caption / Judul">{input(captionKey, "text", "Kota Gorontalo dengan julukannya...")}</Field>
                    </div>
                    <Field label="Views">{input(viewsKey, "number", "282461")}</Field>
                    <Field label="Tipe">{selectType(typeKey)}</Field>
                    <div className="col-span-2">
                      <Field label="Tanggal Post">{input(dateKey, "date")}</Field>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Profile Activity */}
        <div className="glass rounded-2xl p-6">
          <SectionTitle title="Profile Activity" />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Profile Visits">{input("profileVisits", "number", "14892")}</Field>
            <Field label="Profile Visits Change (%)">{input("profileVisitsChange", "number", "-41.9")}</Field>
            <Field label="External Link Taps">{input("externalLinkTaps", "number", "75")}</Field>
            <Field label="Link Taps Change (%)">{input("externalLinkTapsChange", "number", "23.0")}</Field>
          </div>
        </div>

        {/* Follower Growth */}
        <div className="glass rounded-2xl p-6">
          <SectionTitle title="Follower Growth" />
          <div className="grid grid-cols-3 gap-4">
            <Field label="New Follows">{input("followsGained", "number", "1773")}</Field>
            <Field label="Unfollows">{input("unfollows", "number", "1679")}</Field>
            <Field label="Net Growth">{input("netFollowerGrowth", "number", "94")}</Field>
          </div>
        </div>

        {/* Audience */}
        <div className="glass rounded-2xl p-6">
          <SectionTitle title="Audience Data" subtitle="Data demografis followers" />
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Field label="Gender: Pria (%)">{input("genderMen", "number", "47.6")}</Field>
            <Field label="Gender: Wanita (%)">{input("genderWomen", "number", "52.4")}</Field>
          </div>
          <p className="text-white/30 text-xs mb-3">Rentang usia (%):</p>
          <div className="grid grid-cols-4 gap-3 mb-6">
            {(["13to17", "18to24", "25to34", "35to44", "45to54", "55to64", "65plus"] as const).map((range) => (
              <Field key={range} label={`Age ${range.replace("to", "-").replace("plus", "+")} %`}>
                {input(`age${range}` as keyof InputFormData, "number")}
              </Field>
            ))}
          </div>
          <p className="text-white/30 text-xs mb-3">Top Cities:</p>
          <div className="space-y-3">
            {([1, 2, 3, 4, 5] as const).map((n) => (
              <div key={n} className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <Field label={`Kota ${n}`}>{input(`topCity${n}` as keyof InputFormData, "text", "Gorontalo")}</Field>
                </div>
                <Field label="% Followers">{input(`topCity${n}Pct` as keyof InputFormData, "number", "32.6")}</Field>
              </div>
            ))}
          </div>
        </div>
{/* Upload CSV */}
<div className="glass rounded-2xl p-6">
  <div className="border-b border-white/5 pb-4 mb-4">
    <h2 className="font-display text-base font-semibold text-white">Upload Data CSV <span className="text-white/30 text-xs font-normal ml-2">(opsional)</span></h2>
    <p className="text-white/40 text-xs mt-0.5">Upload setelah report tersimpan untuk menambah data harian & per postingan.</p>
  </div>
  <p className="text-white/30 text-xs">Simpan report terlebih dahulu, lalu upload CSV dari halaman Edit atau Reports.</p>
</div>
        {error && (
          <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-orange-500 to-pink-600 text-white font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-orange-500/20"
        >
          {loading ? "Menyimpan..." : "Simpan Report"}
        </button>
      </form>
    </div>
  );
}
