import { Request, Response } from 'express';
import prisma from '../config/db';

export const createQuiz = async (req: Request, res: Response) => {
  try {
    const { levelId, title, passMark, questions } = req.body;
    const quiz = await prisma.quiz.create({
      data: {
        levelId,
        title,
        passMark,
        questions: {
          create: questions.map((q: any) => ({
            text: q.text,
            options: q.options,
            correctOption: q.correctOption,
          })),
        },
      },
      include: { questions: true },
    });
    res.status(201).json(quiz);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getQuizByLevel = async (req: Request, res: Response) => {
  try {
    const { levelId } = req.params;
    const quiz = await prisma.quiz.findUnique({
      where: { levelId },
      include: {
        questions: {
          select: { id: true, text: true, options: true }, // Don't send correctOption
        },
      },
    });
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const submitQuiz = async (req: any, res: Response) => {
  try {
    const { id } = req.params; // quizId
    const { answers } = req.body; // { questionId: selectedOptionIndex }
    const userId = req.user.id;

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: { questions: true, level: true },
    });

    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    let correctCount = 0;
    quiz.questions.forEach((q) => {
      if (answers[q.id] === q.correctOption) {
        correctCount++;
      }
    });

    const score = (correctCount / quiz.questions.length) * 100;
    const passed = score >= quiz.passMark;

    await prisma.quizAttempt.create({
      data: { userId, quizId: id, score, passed },
    });

    if (passed) {
      // Award XP
      await prisma.user.update({
        where: { id: userId },
        data: { xp: { increment: 50 } },
      });

      // Unlock next level logic
      const courseId = quiz.level.courseId;
      const allLevels = await prisma.level.findMany({
        where: { courseId },
        orderBy: { order: 'asc' },
      });

      const currentIndex = allLevels.findIndex(l => l.id === quiz.levelId);
      const nextLevel = allLevels[currentIndex + 1];

      if (nextLevel) {
        await prisma.enrollment.update({
          where: { userId_courseId: { userId, courseId } },
          data: {
            unlockedLevelId: nextLevel.id,
            progress: ((currentIndex + 1) / allLevels.length) * 100,
          },
        });
      } else {
        // Course completed
        await prisma.enrollment.update({
          where: { userId_courseId: { userId, courseId } },
          data: { progress: 100 },
        });

        // Create Certificate
        await prisma.certificate.create({
          data: {
             userId,
             courseId,
             courseTitle: 'Completed Course',
          }
        });
      }
    }

    res.json({ score, passed });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
