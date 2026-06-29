import { Router } from 'express';
import { createQuiz, getQuizByLevel, submitQuiz } from '../controllers/quizController';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

router.post('/', protect, adminOnly, createQuiz);
router.get('/level/:levelId', protect, getQuizByLevel);
router.post('/:id/submit', protect, submitQuiz);

export default router;
