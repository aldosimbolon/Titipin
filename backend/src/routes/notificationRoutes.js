import { Router } from 'express';
import { getMyNotifications, markAsRead, createNotification } from '../controllers/notificationController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/', getMyNotifications);
router.patch('/:id/read', markAsRead);
router.post('/', adminOnly, createNotification);

export default router;
