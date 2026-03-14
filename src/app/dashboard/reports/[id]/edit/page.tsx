"use client";
import { useState, useEffect, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import type { InputFormData } from "@/types";
import { UploadCSV } from "@/components/UploadCSV";

const emptyForm: InputFormData = {
  title: "",
  accountName: "",
  periodStart: "",
  periodEnd: "",
  isPublic: false,
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
      const res = await fetch("/api/reports/" + id);
      const data = await res.json() as {
        title: string;
        accountName: string;
        periodStart: string;
        periodEnd: string;
        isPublic: boolean;
      };
      setForm({
        title: data.title,
        accountName: data.accountName,
        periodStart: data.periodStart.split("T")[0],
        periodEnd: data.periodEnd.split("T")[0],
        isPublic: data.isPublic,
      });
      setLoading(false);
    }
    void loadReport();
  }, [id]);

  function setField<K extends keyof InputFormData>(key: K, value: InputFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/reports/" + id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Gagal menyimpan perubahan");
      router.push("/dashboard/reports/" + id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-xl">
        <div className="glass rounded-2xl h-32 animate-pulse mb-4" />
        <div className="glass rounded-2xl h-64 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Edit Report</h1>
          <p className="text-white/40 text-sm mt-1">Perbarui informasi dan upload CSV.</p>
        </div>
        <button
          onClick={() => router.back()}
          className="text-white/40 hover:text-white/70 text-sm transition-colors"
        >
          Kembali
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass rounded-2xl p-6 space-y-4">
          <div>
            <label className="label-dark">Judul Report</label>
            <input
              type="text"
              className="input-dark"
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
              Buat report publik
            </label>
          </div>
        </div>

        {error && (
          <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

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

      <div className="mt-6">
        <UploadCSV reportId={id} />
      </div>
    </div>
  );
}
