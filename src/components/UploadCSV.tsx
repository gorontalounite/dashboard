"use client";
import { useState, useRef } from "react";

interface Props {
  reportId: string;
  onSuccess?: (result: { posts: number; daily: number }) => void;
}

export function UploadCSV({ reportId, onSuccess }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ posts: number; daily: number; errors: string[] } | null>(null);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    setFiles(selected);
    setResult(null);
    setError("");
  }

  async function handleUpload() {
    if (files.length === 0) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      files.forEach((f) => formData.append("files", f));

      const res = await fetch(`/api/reports/${reportId}/upload-csv`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json() as { success: boolean; posts: number; daily: number; errors: string[]; error?: string };

      if (!res.ok) throw new Error(data.error ?? "Upload gagal");

      setResult({ posts: data.posts, daily: data.daily, errors: data.errors ?? [] });
      setFiles([]);
      if (inputRef.current) inputRef.current.value = "";
      onSuccess?.({ posts: data.posts, daily: data.daily });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass rounded-2xl p-6">
      <div className="border-b border-white/5 pb-4 mb-6">
        <h2 className="font-display text-base font-semibold text-white">Upload Data CSV</h2>
        <p className="text-white/40 text-xs mt-0.5">
          Upload CSV dari Meta Business Suite — data postingan &amp; data harian
        </p>
      </div>

      {/* Drop zone */}
      <div
        className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-orange-500/30 transition-colors cursor-pointer"
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
        <svg className="w-8 h-8 text-white/20 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p className="text-white/40 text-sm">Klik untuk pilih file CSV</p>
        <p className="text-white/20 text-xs mt-1">Bisa upload beberapa file sekaligus</p>
      </div>

      {/* Selected files */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-3 bg-white/3 rounded-lg px-3 py-2">
              <svg className="w-4 h-4 text-orange-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-white/60 text-xs truncate flex-1">{f.name}</span>
              <span className="text-white/30 text-xs">{(f.size / 1024).toFixed(1)} KB</span>
            </div>
          ))}

          <button
            onClick={handleUpload}
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-orange-500 to-pink-600 text-white font-semibold py-2.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 text-sm"
          >
            {loading ? "Memproses..." : `Upload ${files.length} File`}
          </button>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="mt-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
          <p className="text-emerald-400 text-sm font-semibold">✓ Upload berhasil!</p>
          <div className="text-white/50 text-xs mt-1 space-y-0.5">
            {result.posts > 0 && <p>• {result.posts} postingan berhasil diimpor</p>}
            {result.daily > 0 && <p>• {result.daily} data harian berhasil diimpor</p>}
            {result.errors.map((e, i) => (
              <p key={i} className="text-red-400">• {e}</p>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* Info */}
      <div className="mt-4 bg-white/3 rounded-xl p-4">
        <p className="text-white/40 text-xs font-semibold mb-2">FORMAT CSV YANG DIDUKUNG:</p>
        <div className="space-y-1.5 text-white/30 text-xs">
          <p>📊 <span className="text-white/50">Data Postingan</span> — export dari Business Suite (berisi kolom Post ID, Permalink, Views, dll)</p>
          <p>📈 <span className="text-white/50">Data Harian</span> — export chart dari Business Suite (berisi kolom Date/Tanggal + Primary)</p>
          <p className="text-white/20 mt-2">Tip: Nama file otomatis dideteksi untuk menentukan jenis metrik (views, reach, interactions, dll)</p>
        </div>
      </div>
    </div>
  );
}