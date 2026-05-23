# 📦 Titipin - Fullstack Monorepo

Proyek ini telah direstrukturisasi menjadi struktur fullstack modern yang terpisah menjadi **Frontend** dan **Backend**.

## 📂 Struktur Folder Baru
```text
Titipin/
├── package.json          # Konfigurasi Monorepo (Orkestrator)
├── README.md             # Petunjuk Penggunaan Utama
├── .gitignore            # Gitignore tingkat root
├── frontend/             # 💻 React + Vite Frontend App
│   ├── src/              # Source code frontend
│   ├── public/           # Aset publik frontend
│   ├── package.json      # Dependensi frontend
│   └── ...
└── backend/              # ⚙️ Express.js Backend API
    ├── server.js         # Entry point utama server Express
    ├── package.json      # Dependensi backend
    ├── .env              # Konfigurasi Environment Variables (PORT, dll)
    └── src/              # Arsitektur backend terorganisir
        ├── config/       # Konfigurasi database/services
        ├── controllers/  # Logika bisnis per endpoint
        ├── middleware/   # Middleware Express (auth, logging)
        ├── models/       # Skema database
        └── routes/       # Rute endpoint API
```

---

## 🚀 Petunjuk Penggunaan Cepat

Anda dapat mengontrol seluruh proyek (frontend dan backend) dari **root folder `Titipin`** tanpa harus membuka beberapa terminal.

### 1. Instalasi Dependensi Pertama Kali
Jalankan perintah ini di root folder untuk menginstal library pembantu monorepo dan semua dependensi frontend & backend sekaligus:
```bash
npm install
npm run install:all
```

### 2. Menjalankan Server Development (Frontend + Backend)
Nyalakan kedua aplikasi sekaligus dengan satu perintah tunggal:
```bash
npm run dev
```
Setelah dijalankan:
*   **💻 Frontend** akan aktif di: `http://localhost:5173` (atau port default Vite Anda)
*   **⚙️ Backend API** akan aktif di: `http://localhost:5000`
*   **🩺 Tes Kesehatan API**: `http://localhost:5000/api/health`

---

## 🛠️ Perintah Berguna Lainnya (dari Root)

*   **Hanya Jalankan Frontend**: `npm run dev:frontend`
*   **Hanya Jalankan Backend**: `npm run dev:backend`
*   **Build Frontend**: `npm run build`
