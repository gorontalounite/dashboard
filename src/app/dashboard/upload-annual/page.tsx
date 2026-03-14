"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Result = {
  month: string;
  account: string;
  reportId: string;
  created: boolean;
  posts: number;
};

export default function UploadAnnualPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [error, setError] = useState("");

  async function handleUpload() {
    if (!file) return;
    setLoading(true);
    setError("");
    setResults([]);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload-annual", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Upload gagal");
      } else {
        setResults(data.results ?? []);
      }
    } catch {
      setError("Terjadi kesalahan saat upload");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-white">Upload CSV Tahunan</h1>
        <p className="text-white/40 text-sm mt-1">
          Upload satu file CSV yang berisi data postingan beberapa bulan sekaligus. Sistem akan otomatis memisahkan per akun dan per bulan.
        </p>
      </div>

      <div className="glass rounded-2xl p-6 mb-6">
        <h3 className="font-display font-semibold text-white mb-4">Pilih File CSV</h3>
        <div
          className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center cursor-pointer hover:border-orange-500/30 transition-colors"
          onClick={() => document.getElementById("annual-csv")?.click()}
        >
          {file ? (
            <div>
              <p className="text-white font-medium">{file.name}</p>
              <p className="text-white/40 text-xs mt-1">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          ) : (
            <div>
              <svg className="w-10 h-10 text-white/20 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-white/40 text-sm">Klik untuk pilih file CSV</p>
              <p className="text-white/20 text-xs mt-1">Format: CSV dari Instagram Business Suite</p>
            </div>
          )}
        </div>
        <input
          id="annual-csv"
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />

        {error && (
          <p className="text-red-400 text-sm mt-3">{error}</p>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="w-full mt-4 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold py-3.5 rounded-xl transition-all disabled:opacity-50"
        >
          {loading ? "Memproses..." : "Upload & Proses Otomatis"}
        </button>
      </div>

      {results.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <h3 className="font-display font-semibold text-white mb-4">
            Hasil — {results.length} bulan diproses
          </h3>
          <div className="space-y-3">
            {results.sort((a, b) => a.account.localeCompare(b.account) || a.month.localeCompare(b.month)).map((r, i) => (
              <div key={i} className="flex items-center justify-between bg-white/3 rounded-xl px-4 py-3">
                <div>
                  <p className="text-white text-sm font-medium">@{r.account} · {r.month}</p>
                  <p className="text-white/40 text-xs mt-0.5">
                    {r.posts} postingan · {r.created ? "Report baru dibuat" : "Ditambahkan ke report yang ada"}
                  </p>
                </div>
                <button
                  onClick={() => router.push("/dashboard/reports/" + r.reportId)}
                  className="text-orange-400 text-xs hover:text-orange-300 transition-colors"
                >
                  Lihat →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
