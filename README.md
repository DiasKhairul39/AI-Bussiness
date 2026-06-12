# Business Intelligence AI Dashboard (Frontend)

Repositori ini berisi kode sumber antarmuka (*frontend*) untuk platform analisis pasar dan sentimen saham berbasis AI, yang dibangun menggunakan **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, dan **Recharts**.

Aplikasi ini berkomunikasi secara langsung dengan server [BI AI Engine Backend](https://github.com/apq000d6y0584/backend-ai-bussiness).

## 🚀 Live Production URL
Aplikasi ini telah di-deploy secara mandiri (*self-hosted*) menggunakan infrastruktur komersial:
- **Frontend Dashboard**: [https://business-intelligence.bonodigital.biz.id](https://business-intelligence.bonodigital.biz.id)
- **Target API Backend**: `https://bi-api.bonodigital.biz.id`

---

## 🛠️ Fitur Utama Antarmuka
- ✅ **Dynamic Search Bar**: Pencarian ticker saham eksternal (*Global Markets*).
- ✅ **Interactive Stock Chart**: Grafik visual menggunakan Recharts untuk melacak *7-day closing prices*.
- ✅ **AI Sentiment Analysis Card**: Visualisasi skor sentimen finansial FinBERT (skala 1-10) dilengkapi dengan komponen *progress bar*.
- ✅ **Live News Feed**: Scraping berita terkini dari CNBC Headlines secara real-time.
- ✅ **Smart Recommendations**: Panel aksi rekomendasi saham berdasarkan 3 skala prioritas (Tinggi/Sedang/Rendah).
- ✅ **IHSG Market Intelligence Overview**: Dasbor komprehensif untuk memantau pergerakan bursa saham domestik Indonesia.
- ✅ **Production UI Acceleration**: Implementasi *loading states* yang mulus dan *error handling* yang aman dari kegagalan API.

---

## 💻 Pengembangan Lokal (Local Development)

### 1. Prasyarat Sistem
- Node.js versi 18 atau lebih baru (NPM)

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Konfigurasi Environment Variables
Buat berkas `.env.local` di root direktori proyek Anda:
```env
# Untuk pengembangan lokal, arahkan ke localhost backend
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 4. Jalankan Development Server
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di peramban Anda.

---

## 🌐 Panduan Deployment Produksi

### Opsi A: Cloud Platforms (Vercel / Netlify / Cloudflare Pages)
1. Hubungkan repositori GitHub frontend ini ke panel Vercel atau Netlify.
2. Tambahkan Environment Variable: `NEXT_PUBLIC_API_URL=https://bi-api.bonodigital.biz.id`.
3. Klik **Deploy**.

### Opsi B: Production-Grade Infrastructure (Alibaba Cloud ECS) - *Arsitektur Utama*
Untuk menyatukan ekosistem aplikasi, antarmuka frontend Next.js dijalankan mandiri di dalam server ECS yang sama menggunakan PM2 Process Manager:
1. Masuk ke direktori folder frontend Anda di ECS: `cd /root/AI-Bussiness`.
2. Buat file `.env.production` dan arahkan variabel ke subdomain API:
   ```env
   NEXT_PUBLIC_API_URL=https://bi-api.bonodigital.biz.id
   ```
3. Pastikan runtime Node.js v18 aktif, bangun berkas biner produksi, dan jalankan menggunakan PM2 di port `3000`:
   ```bash
   nvm use 18
   npm install
   npm run build
   pm2 start npm --name "nextjs-frontend" -- run start
   pm2 save
   ```
