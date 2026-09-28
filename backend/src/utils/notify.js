import Notification from '../models/Notification.js';
import User from '../models/User.js';

// Buat notifikasi untuk satu user
export const notify = (userId, title, message, type = 'info') =>
  Notification.create({ userId, title, message, type });

// Buat notifikasi untuk semua admin
export const notifyAdmins = async (title, message, type = 'warning') => {
  const admins = await User.find({ role: 'admin' }).select('_id');
  if (admins.length === 0) return;
  await Notification.insertMany(admins.map((a) => ({ userId: a._id, title, message, type })));
};
