import { Request, Response } from 'express';
import prisma from '../config/db';

export const getCourses = async (req: Request, res: Response) => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        levels: true,
      },
    });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getCourseById = async (req: Request, res: Response) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: req.params.id },
      include: {
        levels: {
          orderBy: { order: 'asc' },
          include: {
            quiz: true,
          }
        },
      },
    });
    if (course) {
      res.json(course);
    } else {
      res.status(404).json({ message: 'Course not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createCourse = async (req: Request, res: Response) => {
  try {
    const { title, description, imageUrl } = req.body;
    const course = await prisma.course.create({
      data: {
        title,
        description,
        imageUrl,
      },
    });
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const enrollCourse = async (req: any, res: Response) => {
  try {
    const { id } = req.params; // courseId
    const userId = req.user.id;

    // Check if already enrolled
    const existing = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId: id }
      }
    });

    if (existing) {
      return res.status(400).json({ message: 'Already enrolled' });
    }

    // Find first level to unlock
    const firstLevel = await prisma.level.findFirst({
      where: { courseId: id },
      orderBy: { order: 'asc' }
    });

    const enrollment = await prisma.enrollment.create({
      data: {
        userId,
        courseId: id,
        progress: 0,
        unlockedLevelId: firstLevel ? firstLevel.id : null,
      }
    });

    res.status(201).json(enrollment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
