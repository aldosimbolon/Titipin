import mongoose from 'mongoose';

// Koneksi di-cache supaya aman dipanggil berkali-kali
// (dipakai per-request di Vercel/serverless, dan sekali saat start lokal).
let connecting = null;

export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      'MONGODB_URI tidak ditemukan. Isi di file .env (lokal) atau Environment Variables (Vercel).'
    );
  }

  // 1 = connected
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (connecting) return connecting;

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
