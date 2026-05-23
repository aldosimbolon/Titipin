# 📦 Titipin - Fullstack Monorepo (Precision Flow Logistics)

Platform Jasa Titip (Jastip) global terpercaya yang menghubungkan pengguna dengan layanan pembelian barang dari 6 negara (China, Amerika, Singapura, Korea, Inggris, & Hong Kong). Proyek ini menggunakan arsitektur **Fullstack Monorepo** yang terbagi rapi menjadi **Frontend** dan **Backend** dengan integrasi sistem logistik modern kelas dunia.

---

## ✨ Fitur-Fitur Premium Baru

### 1. Desain Sistem "Precision Flow" (Light-Mint Theme)
*   **Warna Material 3**: Menggunakan palet premium HSL light-mint (`#006954` forest green, `#f6fbf6` surface bright, `#eaefeb` container).
*   **Tipografi Modern**: Didukung oleh font premium `Plus Jakarta Sans` dan ikon vektor presisi `Google Material Symbols Outlined`.
*   **Splitscreen Halaman Awal**: Landing page dengan layout grid 2-kolom dinamis (terinspirasi dari `halamanawal.html`), lengkap dengan kotak link validator dan kartu status pengiriman interaktif *("Tiba di Jakarta")*.

### 2. Gudang Virtual (Virtual Warehouse) & Konsolidasi Paket
*   **Checklist Pengiriman**: Memungkinkan customer memilih secara spesifik beberapa barang yang sudah tiba di gudang luar negeri untuk digabungkan (dikonsolidasi) menjadi satu paket pengiriman besar.
*   **Estimator Berat & Tarif**: Menghitung berat total secara langsung lengkap dengan notifikasi proteksi bea masuk.

### 3. Animasi Kelas Dunia (Powered by Anime.js v4)
*   **Staggered Entrance**: Animasi kartu statis dashboard dan barang gudang yang meluncur masuk secara bertahap.
*   **Slide-Out Exit**: Efek animasi kartu terpilih mengecil, memudar, dan meluncur ke atas secara mulus saat proses konsolidasi diklik sebelum berpindah ke halaman bea cukai.
*   **Declarative Scroll Reveal**: Menggunakan state lokal React sehingga modul animasi transisi FAQ/layanan tidak akan menghilang saat terjadi re-render pada komponen.

---

## 📂 Struktur Folder Proyek
```text
Titipin/
├── package.json          # Konfigurasi Monorepo (Orkestrator)
├── README.md             # Petunjuk Penggunaan Utama
├── .gitignore            # Mengabaikan folder temp & REFERENCE
├── frontend/             # 💻 React + Vite + Anime.js Frontend App
│   ├── src/              # Source code aplikasi React
│   ├── public/           # Logo resmi korporat (/logo.png) dan aset statis
│   ├── package.json      # Dependensi frontend & konfigurasi build
│   └── ...
└── backend/              # ⚙️ Express.js Backend API
    ├── server.js         # Entry point utama server Express
    ├── package.json      # Dependensi Express & parser
    ├── .env              # Konfigurasi Environment Variables (PORT, dll)
    └── src/              # Arsitektur backend terorganisir (MVC)
```

---

## 🚀 Petunjuk Penggunaan Cepat

Anda dapat mengontrol seluruh proyek (frontend dan backend) langsung dari **root folder `Titipin`** hanya dengan satu terminal.

### 1. Instalasi Dependensi Pertama Kali
Jalankan perintah ini di root folder untuk menginstal library pembantu monorepo dan semua dependensi frontend & backend sekaligus:
```bash
npm install
npm run install:all
```

### 2. Menjalankan Server Development (Frontend + Backend)
Nyalakan kedua aplikasi secara bersamaan hanya dengan satu perintah tunggal:
```bash
npm run dev
```
Setelah dijalankan:
*   **💻 Frontend App**: `http://localhost:5173`
*   **⚙️ Backend API**: `http://localhost:5000`
*   **🩺 Tes Kesehatan API**: `http://localhost:5000/api/health`

---

## 🛠️ Perintah Berguna Lainnya (dari Root)

*   **Hanya Jalankan Frontend**: `npm run dev:frontend`
*   **Hanya Jalankan Backend**: `npm run dev:backend`
*   **Kompilasi Frontend (Build)**: `npm run build`

---

## 🌿 Kerja Git Branch Lokal
Seluruh fitur-fitur dan perbaikan visual ini disimpan secara aman dan teratur pada branch kerja lokal baru Anda:
*   **Branch**: `versi-dean`
*   **Commit pertama**: `"code pertama"`
