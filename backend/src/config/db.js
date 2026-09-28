import mongoose from 'mongoose';

// Koneksi di-cache dan aman dipanggil berkali-kali (dipakai per-request di Vercel/serverless,
// dan sekali saat start lokal).
// State mongoose.connection.readyState: 0 = terputus, 1 = terhubung, 2 = sedang menyambung
let connecting = null;

export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      'MONGODB_URI tidak ditemukan. Isi di file .env (lokal) atau Environment Variables (Vercel).'
    );
  }

  // Sudah terhubung
  if (mongoose.connection.readyState === 1) return mongoose.connection;

  // Sedang proses menyambung: tunggu yang sedang berjalan
  if (mongoose.connection.readyState === 2 && connecting) return connecting;

  // Terputus (mis. function serverless sempat "tidur" lalu socket ditutup Atlas): sambung ulang
  mongoose.set('strictQuery', true);

  connecting = mongoose
    .connect(uri, { serverSelectionTimeoutMS: 10000 })
    .then((m) => {
      console.log(`🗄️  MongoDB terhubung: ${m.connection.host}/${m.connection.name}`);
      return m.connection;
    })
    .catch((err) => {
      connecting = null; // biar request berikutnya boleh mencoba lagi
      throw err;
    });

  return connecting;
}

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err.message);
});

export default connectDB;
