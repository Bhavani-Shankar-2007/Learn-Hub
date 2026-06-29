import { Router } from 'express';
import { createLevel, updateLevel, deleteLevel } from '../controllers/levelController';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

router.post('/', protect, adminOnly, createLevel);
router.put('/:id', protect, adminOnly, updateLevel);
router.delete('/:id', protect, adminOnly, deleteLevel);

export default router;
