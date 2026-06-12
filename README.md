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
Untuk kebutuhan lingkungan *live production*, antarmuka ini dijalankan mandiri di dalam server **Alibaba Cloud ECS** bersama dengan Nginx Reverse Proxy dan PM2 Process Manager:
1. Hubungkan server ke repositori dan lakukan kompilasi:
   ```bash
   npm run build
   ```
2. Jalankan proses di latar belakang menggunakan PM2:
   ```bash
   pm2 start npm --name "nextjs-frontend" -- run start
   ```
3. Trafik luar diatur melalui gerbang **Nginx** di port `443` terproteksi SSL penuh dari **Cloudflare**.
