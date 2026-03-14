// src/app/dashboard/input/page.tsx
"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { InputFormData } from "@/types";

const defaultForm: InputFormData = {
  title: "",
  accountName: "gorontalo.unite",
  periodStart: "",
  periodEnd: "",
  isPublic: false,
};

export default function InputPage() {
  const router = useRouter();
  const [form, setForm] = useState<InputFormData>(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function setField<K extends keyof InputFormData>(key: K, value: InputFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
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
      router.push(`/dashboard/reports/${report.id}/edit`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-white">Buat Report Baru</h1>
        <p className="text-white/40 text-sm mt-1">Isi informasi dasar, lalu upload CSV dari halaman Edit.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass rounded-2xl p-6 space-y-4">

          <div>
            <label className="label-dark">Judul Report</label>
            <input
              type="text"
              className="input-dark"
              placeholder="e.g. Februari 2026"
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label-dark">Nama Akun Instagram</label>
            <input
              type="text"
              className="input-dark"
              placeholder="gorontalo.unite"
              value={form.accountName}
              onChange={(e) => setField("accountName", e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-dark">Periode Mulai</label>
              <input
                type="date"
                className="input-dark"
                value={form.periodStart}
                onChange={(e) => setField("periodStart", e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label-dark">Periode Selesai</label>
              <input
                type="date"
                className="input-dark"
                value={form.periodEnd}
                onChange={(e) => setField("periodEnd", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={form.isPublic}
              onChange={(e) => setField("isPublic", e.target.checked)}
              className="w-4 h-4 accent-orange-500"
            />
            <label htmlFor="isPublic" className="text-white/60 text-sm">
              Buat report publik (bisa diakses via link)
            </label>
          </div>
        </div>

        <div className="glass rounded-2xl p-5 border border-orange-500/20">
          <p className="text-white/60 text-sm">
            📂 Setelah simpan, kamu akan diarahkan ke halaman <span className="text-orange-400">Edit</span> untuk upload CSV dari Meta Business Suite.
          </p>
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
          {loading ? "Menyimpan..." : "Simpan & Lanjut Upload CSV →"}
        </button>
      </form>
    </div>
  );
}