import { Router } from 'express';
import {
  getUsers,
  getUserById,
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  setUserActive,
  deleteUser,
} from '../controllers/userController.js';
import { protect, adminOnly, selfOrAdmin } from '../middleware/auth.js';

const router = Router();

router.use(protect); // semua route user butuh login

router.get('/', adminOnly, getUsers);
router.get('/:id', selfOrAdmin('id'), getUserById);
router.put('/:id', selfOrAdmin('id'), updateProfile);
router.delete('/:id', adminOnly, deleteUser);

router.post('/:id/addresses', selfOrAdmin('id'), addAddress);
router.put('/:id/addresses/:addressId', selfOrAdmin('id'), updateAddress);
router.delete('/:id/addresses/:addressId', selfOrAdmin('id'), deleteAddress);

router.patch('/:id/status', adminOnly, setUserActive);

export default router;
