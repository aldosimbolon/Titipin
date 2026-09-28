import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './src/config/db.js';
import authRoutes from './src/routes/authRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import orderRoutes from './src/routes/orderRoutes.js';
import settingRoutes from './src/routes/settingRoutes.js';
import notificationRoutes from './src/routes/notificationRoutes.js';

// Konfigurasi Environment Variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// CLIENT_URL = URL frontend (boleh lebih dari satu, pisahkan koma). Kosong = izinkan semua (dev).
const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((o) => o.trim().replace(/\/$/, ''))
  .filter(Boolean);

app.use(cors({
  origin: allowedOrigins.length ? allowedOrigins : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Pastikan DB terhubung sebelum request diproses (koneksi di-cache, jadi murah).
// Penting untuk Vercel/serverless yang tidak menjalankan start() di bawah.
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

// Rute Welcome & Health Check
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Selamat datang di Titipin API Server',
    status: 'online',
    version: '1.0.0'
  });
});

app.get('/api/health', (req, res) => {
  const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.status(200).json({
    status: 'success',
    message: 'Server backend Titipin berjalan dengan normal',
    database: dbStates[mongoose.connection.readyState] || 'unknown',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Rute API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/notifications', notificationRoutes);

// Middleware untuk Rute Tidak Ditemukan (404)
app.use((req, res, next) => {
  const error = new Error(`Resource ${req.originalUrl} tidak ditemukan`);
  res.status(404);
  next(error);
});

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    status: 'error',
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

// Jalan lokal: konek ke MongoDB dulu, baru start server
async function start() {
  try {
    await connectDB();
  } catch (err) {
    console.error('❌ Gagal konek ke MongoDB:', err.message);
    console.error('👉 Cek MONGODB_URI di file .env (lihat .env.example)');
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`============================================`);
    console.log(`🚀 Titipin API Server berhasil dijalankan!`);
    console.log(`👉 Aktif pada: http://localhost:${PORT}`);
    console.log(`👉 Tes API:    http://localhost:${PORT}/api/health`);
    console.log(`============================================`);
  });
}

// Di Vercel (process.env.VERCEL terisi) server tidak perlu listen sendiri,
// Vercel memanggil `app` lewat api/index.js
if (!process.env.VERCEL) {
  start();
}

export default app;
