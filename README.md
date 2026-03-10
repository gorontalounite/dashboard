# Gorontalo Unite · Social Media Dashboard

Dashboard insight Instagram untuk Gorontalo Unite — input data manual, visualisasi, perbandingan periode, dan share link publik untuk klien.

## Stack

- **Next.js 14** (App Router)
- **TailwindCSS**
- **Recharts** (grafik)
- **Prisma** + **Neon PostgreSQL** (database)
- **NextAuth.js** (autentikasi session-based)
- **jsPDF + html2canvas** (export PDF)

---

## 🚀 Setup Lokal

### 1. Clone & Install

```bash
git clone https://github.com/username/gorontalo-unite-dashboard.git
cd gorontalo-unite-dashboard
npm install
```

### 2. Setup Database (Neon)

1. Daftar di [neon.tech](https://neon.tech) (gratis)
2. Buat project baru
3. Copy **Connection string** (format: `postgresql://...`)
4. Buat file `.env.local`:

```env
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
DIRECT_URL="postgresql://user:pass@host/db?sslmode=require"
NEXTAUTH_SECRET="jalankan: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Migrasi & Seed

```bash
# Buat tabel di database
npx prisma migrate dev --name init

# Tambah user admin pertama
npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
```

**Login default:**
- Email: `admin@gorontalounite.com`
- Password: `admin123`

> ⚠️ Ganti password setelah login pertama!

### 4. Jalankan

```bash
npm run dev
# Buka http://localhost:3000
```

---

## 🌐 Deploy ke Vercel

### 1. Push ke GitHub

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/username/repo.git
git push -u origin main
```

### 2. Import ke Vercel

1. Buka [vercel.com](https://vercel.com)
2. **Add New Project** → import repo GitHub
3. Tambahkan **Environment Variables**:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Connection string Neon |
| `DIRECT_URL` | Connection string Neon (sama) |
| `NEXTAUTH_SECRET` | Random string panjang |
| `NEXTAUTH_URL` | URL Vercel kamu, e.g. `https://dashboard.vercel.app` |

4. Klik **Deploy**

### 3. Migrasi Database di Production

Setelah deploy pertama, jalankan di terminal lokal dengan `DATABASE_URL` production:

```bash
npx prisma migrate deploy
```

---

## 📋 Fitur

| Fitur | Keterangan |
|-------|-----------|
| `/login` | Login untuk tim (3 user, role ADMIN) |
| `/dashboard` | Overview semua report |
| `/dashboard/input` | Form input data insight manual |
| `/dashboard/reports` | List report + toggle publik + copy share link |
| `/dashboard/compare` | Perbandingan visual hingga 4 report |
| `/report/[token]` | Halaman publik untuk klien (tanpa login) |

### Alur Kerja
1. Tim login → buka `/dashboard/input`
2. Input semua data dari screenshot Instagram Insight
3. Simpan → report tersimpan di database
4. Di `/dashboard/reports`, toggle **Publik** → **Copy Link**
5. Kirim link ke klien → klien buka tanpa perlu login
6. Klik **Export PDF** untuk download laporan

---

## 👥 Tambah User Tim

Jalankan di terminal (atau buat endpoint admin):

```javascript
// Di prisma/seed.ts atau script terpisah
const user2 = await prisma.user.create({
  data: {
    email: "team@gorontalounite.com",
    name: "Nama Anggota",
    password: await bcrypt.hash("password123", 12),
    role: "ADMIN",
  },
});
```

---

## 📁 Struktur Project

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/   # NextAuth handler
│   │   ├── reports/              # GET list, POST create
│   │   ├── reports/[id]/         # GET, PATCH, DELETE
│   │   └── public/[token]/       # Public report API
│   ├── dashboard/
│   │   ├── page.tsx              # Overview
│   │   ├── input/                # Form input
│   │   ├── reports/              # List & detail
│   │   └── compare/              # Perbandingan
│   ├── login/                    # Halaman login
│   └── report/[token]/           # Halaman publik klien
├── components/
│   ├── Sidebar.tsx
│   ├── StatCard.tsx
│   ├── ReportCharts.tsx
│   └── ReportView.tsx
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   └── utils.ts
└── types/
    └── index.ts
```
