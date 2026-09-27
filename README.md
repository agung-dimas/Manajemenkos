# 🏢 Sistem Manajemen Kost

Aplikasi berbasis web modern untuk mengelola operasional bisnis kost-kostan secara efisien. Dibangun dengan teknologi terkini untuk memberikan pengalaman terbaik bagi pemilik kost (admin) dan penghuni (tenant).

## ✨ Fitur Utama

- **📊 Dashboard Interaktif**: Ringkasan data keuangan, jumlah kamar kosong/terisi, dan status pembayaran penghuni dengan grafik visual.
- **🚪 Manajemen Kamar**: Tambah, edit, hapus data kamar beserta fasilitas dan harga sewanya.
- **👥 Manajemen Penghuni (Tenant)**: Pencatatan data penghuni kost yang aktif beserta riwayat kamarnya.
- **💳 Sistem Pembayaran & Tagihan (Invoice)**: 
  - Pencatatan pembayaran uang sewa.
  - Pembuatan dan cetak struk/invoice otomatis (PDF).
- **💸 Pencatatan Pengeluaran**: Lacak pengeluaran operasional kost (listrik, air, perbaikan, dll).
- **📈 Laporan Keuangan**: Cetak laporan pendapatan dan pengeluaran bulanan/tahunan (Export ke Excel).
- **💬 Notifikasi WhatsApp**: Terintegrasi dengan sistem pengiriman pesan WhatsApp untuk mengingatkan tagihan penghuni.
- **🔒 Autentikasi**: Sistem login aman menggunakan Supabase Auth untuk Admin dan Penghuni.

## 🛠️ Tech Stack

Aplikasi ini dibangun menggunakan ekosistem modern JavaScript/TypeScript:

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Bahasa**: [TypeScript](https://www.typescriptlang.org/)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Komponen UI**: [shadcn/ui](https://ui.shadcn.com/) & Radix UI
- **PDF & Export**: `jspdf`, `jspdf-autotable`, `xlsx`
- **Charts**: `recharts`

## 🚀 Cara Menjalankan Project di Komputer Lokal

### 1. Persyaratan Sistem
Pastikan Anda sudah menginstal:
- Node.js (Versi 18 atau ke atas disarankan)
- Git

### 2. Kloning Repository
```bash
git clone https://github.com/kuliahhavis-droid/manajemen-kost.git
cd manajemen-kos
```

### 3. Instalasi Dependensi
Jalankan perintah berikut untuk menginstal semua library yang dibutuhkan:
```bash
npm install
```

### 4. Konfigurasi Environment Variables
Buat file bernama `.env` di direktori utama (root) proyek Anda dan tambahkan konfigurasi database Supabase Anda:
```env
# URL dan KEY dari Supabase
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT_ID].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[ANON_KEY_ANDA]"

# Koneksi Database untuk Prisma
DATABASE_URL="postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DB_NAME]?pgbouncer=true"
DIRECT_URL="postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DB_NAME]"
```

### 5. Sinkronisasi Database (Prisma)
Generate Prisma client dan dorong skema database ke Supabase:
```bash
npx prisma generate
npx prisma db push
```

### 6. Jalankan Aplikasi
Jalankan server pengembangan:
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser Anda untuk melihat hasilnya.

## 📦 Deployment (Vercel)

Aplikasi ini sangat direkomendasikan untuk di-deploy melalui [Vercel](https://vercel.com/):
1. Login ke Vercel dan buat project baru dari repository GitHub Anda.
2. Jangan lupa untuk memasukkan semua variabel lingkungan yang ada di file `.env` ke bagian **Environment Variables** di Vercel.
3. Klik **Deploy** dan tunggu proses build selesai.

---
*Dibuat untuk mempermudah pengelolaan kost Anda. 🚀*
