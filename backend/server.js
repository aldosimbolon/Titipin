import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Konfigurasi Environment Variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // Di fase production, sesuaikan dengan URL frontend Anda
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Rute Welcome & Health Check
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Selamat datang di Titipin API Server',
    status: 'online',
    version: '1.0.0'
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server backend Titipin berjalan dengan normal',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

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

// Mulai Server
app.listen(PORT, () => {
  console.log(`============================================`);
  console.log(`🚀 Titipin API Server berhasil dijalankan!`);
  console.log(`👉 Aktif pada: http://localhost:${PORT}`);
  console.log(`👉 Tes API:    http://localhost:${PORT}/api/health`);
  console.log(`============================================`);
});
