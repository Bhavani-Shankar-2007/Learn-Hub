import express from 'express';
import cors from 'cors';
import { config } from './config/env';
import authRoutes from './routes/authRoutes';
import courseRoutes from './routes/courseRoutes';
import levelRoutes from './routes/levelRoutes';
import quizRoutes from './routes/quizRoutes';
import bookRoutes from './routes/bookRoutes';
import dashboardRoutes from './routes/dashboardRoutes';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/levels', levelRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Base route
app.get('/', (req, res) => {
  res.send('LearnHub API is running.');
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
