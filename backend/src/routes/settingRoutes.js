import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settingController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

router.get('/', getSettings); // publik: dipakai buat hitung estimasi harga juga
router.put('/', protect, adminOnly, updateSettings);

export default router;
