# Deploy Titipin ke Vercel

Repo ini monorepo: `frontend/` (Vite + React) dan `backend/` (Express + MongoDB Atlas).
Di Vercel dibuat **2 project** dari repo GitHub yang sama.

## 1. Backend (deploy dulu)
- Add New > Project > pilih repo Titipin
- **Root Directory**: `backend`
- Environment Variables:
  - `MONGODB_URI` : connection string Atlas (dengan nama database `/titipin`)
  - `JWT_SECRET`  : string acak panjang
  - `JWT_EXPIRES_IN` : `7d`
  - `CLIENT_URL`  : URL frontend (diisi setelah frontend jadi, lalu Redeploy)
- Deploy, lalu cek `https://<backend>.vercel.app/api/health` -> `database: "connected"`

## 2. Frontend
- Add New > Project > repo yang sama
- **Root Directory**: `frontend` (Framework: Vite, otomatis)
- Environment Variables:
  - `VITE_API_URL` : `https://<backend>.vercel.app/api`
- Deploy

## 3. Sambungkan
- Kembali ke project backend > Settings > Environment Variables > isi `CLIENT_URL` dengan URL frontend
  (tanpa `/` di akhir), lalu Redeploy.
- Pastikan di MongoDB Atlas > Network Access ada `0.0.0.0/0` (Vercel memakai IP dinamis).

## Catatan
- File `.env` TIDAK boleh di-commit (sudah di-ignore). Isi secret lewat dashboard Vercel.
- Setiap `git push` ke `main` otomatis deploy ulang kedua project.
