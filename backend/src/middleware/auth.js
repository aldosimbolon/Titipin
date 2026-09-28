import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Melindungi route: wajib kirim header "Authorization: Bearer <token>".
// Kalau valid, req.user diisi dokumen User (tanpa field password).
export const protect = asyncHandler(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('Tidak ada token, akses ditolak');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    res.status(401);
    throw new Error('Token tidak valid atau sudah kedaluwarsa');
  }

  const user = await User.findById(decoded.id).select('-password');
  if (!user) {
    res.status(401);
    throw new Error('User untuk token ini tidak ditemukan');
  }
  if (!user.isActive) {
    res.status(403);
    throw new Error('Akun kamu sudah dinonaktifkan, hubungi admin');
  }

  req.user = user;
  next();
});

// Dipasang SETELAH protect. Hanya lolos kalau role user = admin.
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  res.status(403);
  throw new Error('Akses ditolak: khusus admin');
};

// Lolos kalau user adalah admin ATAU user itu sendiri (dicocokkan dari req.params.id / paramName)
export const selfOrAdmin = (paramName = 'id') => (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user._id === req.params[paramName])) {
    return next();
  }
  res.status(403);
  throw new Error('Akses ditolak: bukan pemilik data ini');
};
