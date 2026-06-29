import { Router } from 'express';
import { getBooks, createBook, createOrder, verifyPayment } from '../controllers/bookController';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

router.get('/', getBooks);
router.post('/', protect, adminOnly, createBook);
router.post('/order', protect, createOrder);
router.post('/verify', protect, verifyPayment);

export default router;
