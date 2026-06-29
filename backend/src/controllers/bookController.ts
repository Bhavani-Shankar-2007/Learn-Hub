import { Request, Response } from 'express';
import prisma from '../config/db';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { config } from '../config/env';

export const getBooks = async (req: Request, res: Response) => {
  try {
    const books = await prisma.book.findMany();
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createBook = async (req: Request, res: Response) => {
  try {
    const { title, description, coverUrl, pdfUrl, price } = req.body;
    const book = await prisma.book.create({
      data: { title, description, coverUrl, pdfUrl, price },
    });
    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createOrder = async (req: any, res: Response) => {
  try {
    const { bookId } = req.body;
    const book = await prisma.book.findUnique({ where: { id: bookId } });
    
    if (!book) return res.status(404).json({ message: 'Book not found' });

    // Ensure Razorpay instance is created
    if (!config.razorpayKeyId || config.razorpayKeyId === 'rzp_test_placeholder') {
       // Mock for development if no key is provided
       const payment = await prisma.payment.create({
         data: {
           userId: req.user.id,
           amount: book.price,
           status: 'COMPLETED',
         }
       });

       await prisma.bookPurchase.create({
         data: {
           userId: req.user.id,
           bookId: book.id,
           paymentId: payment.id,
         }
       });

       return res.json({ mock: true, message: 'Mock payment successful', bookId: book.id });
    }

    const instance = new Razorpay({
      key_id: config.razorpayKeyId,
      key_secret: config.razorpayKeySecret,
    });

    const options = {
      amount: book.price * 100, // amount in the smallest currency unit
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`
    };

    const order = await instance.orders.create(options);
    
    await prisma.payment.create({
      data: {
        userId: req.user.id,
        amount: book.price,
        razorpayOrderId: order.id,
        status: 'PENDING',
      }
    });

    res.json({ ...order, key: config.razorpayKeyId });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const verifyPayment = async (req: any, res: Response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookId } = req.body;
    const userId = req.user.id;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', config.razorpayKeySecret)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      // Payment is successful
      await prisma.payment.updateMany({
        where: { razorpayOrderId: razorpay_order_id },
        data: {
          razorpayPaymentId: razorpay_payment_id,
          status: 'COMPLETED',
        },
      });

      const payment = await prisma.payment.findFirst({
        where: { razorpayOrderId: razorpay_order_id }
      });

      if (payment) {
        await prisma.bookPurchase.create({
          data: {
            userId,
            bookId,
            paymentId: payment.id,
          }
        });
      }

      res.json({ success: true, message: 'Payment verified successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid signature' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
