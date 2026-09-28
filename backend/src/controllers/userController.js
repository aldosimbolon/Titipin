import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { generateAddressId } from '../utils/generateId.js';

// @route GET /api/users   (admin)
export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.status(200).json({ status: 'success', results: users.length, data: { users } });
});

// @route GET /api/users/:id   (admin atau pemilik akun)
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) {
    res.status(404);
    throw new Error('User tidak ditemukan');
  }
  res.status(200).json({ status: 'success', data: { user } });
});

// @route PUT /api/users/:id   (pemilik akun sendiri)
// @desc  Update profil (name/phone/npwp/avatar), daftar alamat (replace penuh), atau ganti password
//        (butuh currentPassword). Email & role tidak bisa diubah lewat sini.
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, npwp, avatar, addresses, password, currentPassword } = req.body;

  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User tidak ditemukan');
  }

  if (password !== undefined) {
    if (String(password).length < 6) {
      res.status(400);
      throw new Error('Password baru minimal 6 karakter');
    }
    if (!currentPassword || !(await user.comparePassword(currentPassword))) {
      res.status(400);
      throw new Error('Password lama salah');
    }
    user.password = password;
  }

  if (name !== undefined) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (npwp !== undefined) user.npwp = npwp;
  if (avatar !== undefined) user.avatar = avatar;
  if (Array.isArray(addresses)) {
    user.addresses = addresses.map((a) => ({ ...a, id: a.id || generateAddressId() }));
  }

  await user.save();
  res.status(200).json({ status: 'success', data: { user } });
});

// @route POST /api/users/:id/addresses   (pemilik akun sendiri)
export const addAddress = asyncHandler(async (req, res) => {
  const { label, recipient, phone, address, city, province, postalCode, isDefault } = req.body;

  if (!recipient || !phone || !address || !city || !province) {
    res.status(400);
    throw new Error('recipient, phone, address, city, dan province wajib diisi');
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User tidak ditemukan');
  }

  const newAddress = {
    id: generateAddressId(),
    label: label || '',
    recipient,
    phone,
    address,
    city,
    province,
    postalCode: postalCode || '',
    isDefault: !!isDefault,
  };

  // Kalau ditandai default, address lain jadi non-default
  if (newAddress.isDefault) {
    user.addresses.forEach((a) => { a.isDefault = false; });
  }

  user.addresses.push(newAddress);
  await user.save();
  res.status(201).json({ status: 'success', data: { addresses: user.addresses } });
});

// @route PUT /api/users/:id/addresses/:addressId
export const updateAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User tidak ditemukan');
  }

  const addr = user.addresses.find((a) => a.id === req.params.addressId);
  if (!addr) {
    res.status(404);
    throw new Error('Alamat tidak ditemukan');
  }

  const fields = ['label', 'recipient', 'phone', 'address', 'city', 'province', 'postalCode'];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) addr[f] = req.body[f];
  });

  if (req.body.isDefault) {
    user.addresses.forEach((a) => { a.isDefault = a.id === addr.id; });
  }

  await user.save();
  res.status(200).json({ status: 'success', data: { addresses: user.addresses } });
});

// @route DELETE /api/users/:id/addresses/:addressId
export const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User tidak ditemukan');
  }

  const before = user.addresses.length;
  user.addresses = user.addresses.filter((a) => a.id !== req.params.addressId);

  if (user.addresses.length === before) {
    res.status(404);
    throw new Error('Alamat tidak ditemukan');
  }

  await user.save();
  res.status(200).json({ status: 'success', data: { addresses: user.addresses } });
});

// @route PATCH /api/users/:id/status   (admin) - aktif/nonaktifkan akun
export const setUserActive = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  if (typeof isActive !== 'boolean') {
    res.status(400);
    throw new Error('isActive harus boolean (true/false)');
  }

  const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true }).select('-password');
  if (!user) {
    res.status(404);
    throw new Error('User tidak ditemukan');
  }
  res.status(200).json({ status: 'success', data: { user } });
});

// @route DELETE /api/users/:id   (admin)
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User tidak ditemukan');
  }
  res.status(200).json({ status: 'success', data: null });
});
