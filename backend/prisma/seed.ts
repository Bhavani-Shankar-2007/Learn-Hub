import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Create an Admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@learnhub.com' },
    update: {},
    create: {
      email: 'admin@learnhub.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log(`Admin created: ${admin.email}`);

  // Create a Sample Course
  const course = await prisma.course.create({
    data: {
      title: 'Full-Stack Web Development 101',
      description: 'Learn the fundamentals of building modern web applications from scratch using React and Node.js.',
      imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=800&auto=format&fit=crop',
    },
  });
  console.log(`Course created: ${course.title}`);

  // Create a Level
  const level = await prisma.level.create({
    data: {
      courseId: course.id,
      title: 'Introduction to React',
      description: 'Understanding components, props, and state.',
      order: 1,
      videoUrl: 'https://www.youtube.com/embed/bMknfKXIFA8', // Sample React video
    },
  });
  console.log(`Level created: ${level.title}`);

  // Create a Quiz for the Level
  const quiz = await prisma.quiz.create({
    data: {
      levelId: level.id,
      title: 'React Basics Quiz',
      passMark: 50.0,
      questions: {
        create: [
          {
            text: 'What is used to pass data to a component from outside?',
            options: ['State', 'Props', 'Context', 'Hooks'],
            correctOption: 1, // Props (index 1)
          },
          {
            text: 'Which hook is used to manage local state?',
            options: ['useEffect', 'useReducer', 'useState', 'useRef'],
            correctOption: 2, // useState (index 2)
          }
        ]
      }
    }
  });
  console.log(`Quiz created: ${quiz.title}`);

  // Create a Book
  const book = await prisma.book.create({
    data: {
      title: 'The Modern JavaScript Developer',
      description: 'A comprehensive guide to ES6+ features and best practices for modern web development.',
      coverUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop',
      pdfUrl: '#', // Placeholder for actual PDF
      price: 299, // ₹299
    }
  });
  console.log(`Book created: ${book.title}`);

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
