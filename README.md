# चेtanā - Mental Wellness App

A comprehensive mental health platform with AI chat, assessments, and progress tracking.

## Setup Instructions

### 1. Environment Variables
Copy `.env.example` to `.env` and fill in your database credentials:
```bash
cp .env.example .env
```

Required environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `PORT` - Server port (default: 3000)

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Server
```bash
npm start
```
Or for development:
```bash
npm run dev
```

### 4. Access the Application
Open your browser and go to `http://localhost:3000`

## Features
- User registration and authentication
- AI-powered mental health chat
- PHQ-9, GAD-7, and PSS-10 assessments
- Progress tracking with charts
- Admin panel for user management
- Push notification system with daily reminders
- Duolingo-style streak tracking with strict deadlines
- Server-side notification scheduling
- Browser and mobile push notification support

## Admin Access
- Email: `admin@chetana.com`
- Password: `admin123`

## Database
Uses PostgreSQL with automatic table creation on first run.

## Deployment
When deploying, set the environment variables in your hosting platform's dashboard.