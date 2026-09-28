import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { generateUserId } from '../utils/generateId.js';

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// Bentuk data user yang aman dikirim ke client (tanpa password)
const toSafeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  avatar: user.avatar,
  npwp: user.npwp,
  addresses: user.addresses,
  isActive: user.isActive,
  createdAt: user.createdAt,
});

// @route POST /api/auth/register
// @desc  Registrasi user baru (selalu role customer)
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, npwp } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('name, email, dan password wajib diisi');
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    res.status(409);
    throw new Error('Email sudah terdaftar');
  }

  const user = await User.create({
    _id: generateUserId(),
    name,
    email,
    password,
    phone: phone || '',
    npwp: npwp || '',
    role: 'customer',
    addresses: [],
  });

  const token = signToken(user);
  res.status(201).json({ status: 'success', data: { user: toSafeUser(user), token } });
});

// @route POST /api/auth/login
// @desc  Login untuk customer maupun admin
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('email dan password wajib diisi');
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error('Email atau password salah');
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error('Akun kamu sudah dinonaktifkan, hubungi admin');
  }

  const token = signToken(user);
  res.status(200).json({ status: 'success', data: { user: toSafeUser(user), token } });
});

// @route GET /api/auth/me
// @desc  Data user yang sedang login (butuh token)
export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({ status: 'success', data: { user: toSafeUser(req.user) } });
});
