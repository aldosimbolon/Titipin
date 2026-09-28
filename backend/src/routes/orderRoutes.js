import { Router } from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  setQuote,
  updateOrderStatus,
  addOrderNote,
  deleteOrder,
  payOrder,
  consolidateOrders,
} from '../controllers/orderController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

router.use(protect); // semua route order butuh login

router.post('/', createOrder);
router.post('/consolidate', consolidateOrders);
router.get('/', getOrders);
router.get('/:id', getOrderById);
router.put('/:id/quote', adminOnly, setQuote);
router.put('/:id/status', adminOnly, updateOrderStatus);
router.post('/:id/notes', addOrderNote);
router.post('/:id/pay', payOrder);
router.delete('/:id', adminOnly, deleteOrder);

export default router;
