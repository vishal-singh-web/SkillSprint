# SkillSprint 2026 Backend

AI-powered placement prep assistant backend for 2026 students.

## Tech Stack

- Node.js
- Express.js
- JavaScript
- CORS
- dotenv
- Gemini API with `@google/generative-ai`
- In-memory mock database for hackathon demos

## Install

```bash
cd backend
npm install
```

## Environment

Create a `.env` file:

```text
PORT=5000
GEMINI_API_KEY=your_api_key_here
```

If `GEMINI_API_KEY` is missing or Gemini returns invalid JSON, the backend returns safe fallback demo data.

## Run

```bash
npm start
```

For development with auto-restart:

```bash
npm run dev
```

The server runs on:

```text
http://localhost:5000
```

## API Test Requests

### Health Check

```bash
curl http://localhost:5000/
```

### 1. AI Skill Gap Analysis

```bash
curl -X POST http://localhost:5000/api/skill-gap \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"user123\",\"targetRole\":\"Frontend Developer\",\"resumeText\":\"I know HTML, CSS, JS, React and built a portfolio website.\"}"
```

### 2. Get Current Daily Tasks

```bash
curl "http://localhost:5000/api/daily-tasks?userId=user123"
```

### 3. Generate AI Daily 3 Tasks

```bash
curl -X POST http://localhost:5000/api/daily-tasks/generate \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"user123\",\"targetRole\":\"Frontend Developer\"}"
```

### 4. Mood-Aware Difficulty

```bash
curl -X POST http://localhost:5000/api/mood \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"user123\",\"mood\":\"low\"}"
```

Allowed mood values:

```text
low, neutral, high
```

### 5. AI Mock Interview Message

```bash
curl -X POST http://localhost:5000/api/interview/message \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"user123\",\"targetRole\":\"Frontend Developer\",\"message\":\"I built a React dashboard with authentication.\"}"
```

### 6. Progress

```bash
curl "http://localhost:5000/api/progress?userId=user123"
```

### 7. Mark Task Complete

```bash
curl -X POST http://localhost:5000/api/progress/task-complete \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"user123\",\"taskId\":1}"
```

## Supabase Upgrade Point

The current demo uses `data/mockDb.js`.

To add Supabase later:

1. Add Supabase credentials to `.env`
2. Install the Supabase client
3. Replace reads and writes in the `services/` folder with Supabase queries
4. Keep controllers and routes the same
