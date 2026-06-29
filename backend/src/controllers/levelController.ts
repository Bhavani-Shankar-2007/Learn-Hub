import { Request, Response } from 'express';
import prisma from '../config/db';

export const createLevel = async (req: Request, res: Response) => {
  try {
    const { courseId, title, description, order, videoUrl } = req.body;
    const level = await prisma.level.create({
      data: { courseId, title, description, order, videoUrl },
    });
    res.status(201).json(level);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateLevel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const level = await prisma.level.update({
      where: { id },
      data,
    });
    res.json(level);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteLevel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.level.delete({ where: { id } });
    res.json({ message: 'Level removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
