import Notification from '../models/Notification.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// @route GET /api/notifications   (punya sendiri)
export const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json({ status: 'success', results: notifications.length, data: { notifications } });
});

// @route PATCH /api/notifications/:id/read   (punya sendiri)
export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) {
    res.status(404);
    throw new Error('Notifikasi tidak ditemukan');
  }
  if (notification.userId !== req.user._id) {
    res.status(403);
    throw new Error('Akses ditolak: bukan pemilik notifikasi ini');
  }

  notification.read = true;
  await notification.save();
  res.status(200).json({ status: 'success', data: { notification } });
});

// @route POST /api/notifications   (admin) - kirim notifikasi ke user tertentu
export const createNotification = asyncHandler(async (req, res) => {
  const { userId, title, message, type } = req.body;
  if (!userId || !title || !message) {
    res.status(400);
    throw new Error('userId, title, dan message wajib diisi');
  }

  const notification = await Notification.create({
    userId,
    title,
    message,
    type: type || 'info',
  });

  res.status(201).json({ status: 'success', data: { notification } });
});
