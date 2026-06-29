import { Router } from 'express';
import { getCourses, getCourseById, createCourse, enrollCourse } from '../controllers/courseController';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

router.get('/', getCourses);
router.get('/:id', getCourseById);
router.post('/', protect, adminOnly, createCourse);
router.post('/:id/enroll', protect, enrollCourse);

export default router;
