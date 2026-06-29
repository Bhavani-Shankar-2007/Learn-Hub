# LearnHub - Full-Stack Learning Management System

LearnHub is a comprehensive Learning Management System built with the modern stack: React, Vite, Tailwind CSS (v4), Node.js, Express, and PostgreSQL (via Prisma).

## Architecture

- **Backend**: `/backend` - Node.js Express API. Connects to PostgreSQL via Prisma.
- **Frontend**: `/frontend` - React SPA built with Vite. Uses Tailwind CSS, shadcn/ui, and React Router.

## Prerequisites for Windows

1. **Node.js**: Ensure Node.js (v18+ recommended) is installed. You can download it from [nodejs.org](https://nodejs.org).
2. **PostgreSQL**: You need a running PostgreSQL database. You mentioned using **Supabase**:
   - Go to [Supabase](https://supabase.com/) and create a project.
   - Go to Project Settings -> Database and copy the connection string (URI).
   - *Alternative*: If you have Docker Desktop installed, you can simply run `docker-compose up -d` in this root directory (a `docker-compose.yml` is provided).

## Step-by-Step Setup Guide

### 1. Database Configuration
Open the file `backend/.env` and replace the `DATABASE_URL` with your Supabase PostgreSQL connection string. 
```env
DATABASE_URL="your-supabase-connection-string-here"
```

If you want to use Razorpay for book purchases, also add your Test Keys in `backend/.env`:
```env
RAZORPAY_KEY_ID="rzp_test_xxxxxx"
RAZORPAY_KEY_SECRET="your_secret"
```

### 2. Install Dependencies
Open a PowerShell or Command Prompt terminal in the **root** folder of this project (where this README is located).

Run the following command to install all dependencies for both the frontend and backend:
```cmd
npm run install:all
```
*(This will run `npm install` in root, then in the `/backend` folder, and finally in the `/frontend` folder).*

### 3. Initialize the Database Schema
Next, you need to push the database schema to Supabase (or your local Postgres).
Navigate to the backend directory and run the Prisma push command:

```cmd
cd backend
npx prisma db push
cd ..
```

### 4. Run the Application
Finally, start both the frontend and backend servers concurrently from the root directory:

```cmd
npm run dev
```

- The **Backend API** will run at: `http://localhost:5000`
- The **Frontend App** will run at: `http://localhost:5173`

Open `http://localhost:5173` in your browser. You can create an account and explore the dashboard!

## Features Implemented
- **Authentication**: JWT-based auth with Admin and Student roles.
- **Gamification**: XP tracking, Daily Streaks, UI elements.
- **Course & Levels**: Complete Prisma schema for courses, levels, quizzes, questions, and attempts.
- **Payments**: Razorpay backend setup for purchasing books.
- **Dashboards**: Animated, dark-mode ready, premium SaaS-style React dashboards.
