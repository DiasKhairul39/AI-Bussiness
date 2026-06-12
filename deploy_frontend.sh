#!/bin/bash

# =====================================================
# Skrip Otomatisasi Deployment / Update Next.js Frontend
# Capstone Project - Dashboard Engine v1.0
# =====================================================

set -e  # Hentikan eksekusi jika ada perintah yang gagal

APP_DIR=$(pwd)
PM2_NAME="nextjs-frontend"
NODE_VERSION="18"

echo "======================================================="
echo " 🌐 Frontend Dashboard - Deployment & Update Script"
echo " Working Directory: $APP_DIR"
echo "======================================================="

# 1. Memastikan Node.js & NVM Aktif
echo ""
echo "[1/5] Memverifikasi lingkungan Node.js via NVM..."
export NVM_DIR="$HOME/.nvm"
if [ -s "$NVM_DIR/nvm.sh" ]; then
    source "$NVM_DIR/nvm.sh"
    nvm use $NODE_VERSION
else
    echo "❌ Error: NVM tidak ditemukan di server!"
    exit 1
fi

# 2. Menarik kode terbaru dari GitHub
echo ""
echo "[2/5] Menarik pembaruan kode terbaru dari GitHub..."
git pull origin main

# 3. Instalasi Dependensi Baru (Jika Ada)
echo ""
echo "[3/5] Memeriksa dan menginstal pustaka dependensi baru..."
npm install

# 4. Melakukan Kompilasi Ulang (Production Build)
echo ""
echo "[4/5] Memulai kompilasi biner Next.js (npm run build)..."
npm run build

# 5. Memuat ulang aplikasi di PM2
echo ""
echo "[5/5] Melakukan restart layanan pada PM2 Process Manager..."
if pm2 status | grep -q "$PM2_NAME"; then
    pm2 restart $PM2_NAME
    echo "  -> Layanan PM2 '$PM2_NAME' berhasil dimuat ulang."
else
    echo "  -> Layanan PM2 belum terdaftar. Mendaftarkan layanan baru..."
    pm2 start npm --name "$PM2_NAME" -- run start
fi

# Mengunci status PM2 ke dalam sistem startup
pm2 save

echo ""
echo "======================================================="
echo " ✅ PEMBARUAN FRONTEND BERHASIL!"
echo " URL Dashboard: https://business-intelligence.bonodigital.biz.id"
echo "======================================================="
