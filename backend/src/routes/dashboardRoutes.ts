import { Router } from 'express';
import { getAdminDashboard, getStudentDashboard } from '../controllers/dashboardController';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

router.get('/admin', protect, adminOnly, getAdminDashboard);
router.get('/student', protect, getStudentDashboard);

export default router;
