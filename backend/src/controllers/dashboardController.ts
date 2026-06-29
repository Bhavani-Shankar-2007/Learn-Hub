import { Request, Response } from 'express';
import prisma from '../config/db';

export const getAdminDashboard = async (req: Request, res: Response) => {
  try {
    const totalStudents = await prisma.user.count({ where: { role: 'STUDENT' } });
    const totalCourses = await prisma.course.count();
    const totalBooks = await prisma.bookPurchase.count();
    
    const payments = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: 'COMPLETED' },
    });
    const revenue = payments._sum.amount || 0;

    const recentPayments = await prisma.payment.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    });

    res.json({
      totalStudents,
      totalCourses,
      totalBooks,
      revenue,
      recentPayments,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getStudentDashboard = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;

    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: { course: true },
    });

    const bookPurchases = await prisma.bookPurchase.findMany({
      where: { userId },
      include: { book: true },
    });

    const certificates = await prisma.certificate.findMany({
      where: { userId },
    });

    res.json({
      enrollments,
      bookPurchases,
      certificates,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
