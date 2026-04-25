# SkillSprint 2026 Backend

AI-powered placement prep assistant backend for 2026 students.

## Tech Stack

- Node.js
- Express.js
- JavaScript
- CORS
- dotenv
- In-memory mock database for hackathon demos

## Install

```bash
cd backend
npm install
```

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

### 1. Skill Gap Analysis

```bash
curl -X POST http://localhost:5000/api/skill-gap \
  -H "Content-Type: application/json" \
  -d "{\"resumeText\":\"I built a MERN project using React, Node.js, Express, MongoDB and JWT authentication.\"}"
```

### 2. Daily Tasks

```bash
curl http://localhost:5000/api/daily-tasks
```

### 3. Mood-Aware Difficulty

```bash
curl -X POST http://localhost:5000/api/mood \
  -H "Content-Type: application/json" \
  -d "{\"mood\":\"low\"}"
```

Allowed mood values:

```text
low, neutral, high
```

### 4. Mock Interview Message

```bash
curl -X POST http://localhost:5000/api/interview/message \
  -H "Content-Type: application/json" \
  -d "{\"role\":\"frontend developer\",\"message\":\"I built a MERN project with authentication\"}"
```

### 5. Progress

```bash
curl http://localhost:5000/api/progress
```

### 6. Mark Task Complete

```bash
curl -X POST http://localhost:5000/api/progress/task-complete \
  -H "Content-Type: application/json" \
  -d "{\"taskId\":1}"
```

## Postman Notes

Use `http://localhost:5000` as the base URL.

For POST requests:

- Go to the `Body` tab
- Select `raw`
- Select `JSON`
- Paste the request JSON from the examples above

## Supabase Upgrade Point

The current demo uses `data/mockDb.js`.

To add Supabase later:

1. Add Supabase credentials to `.env`
2. Install the Supabase client
3. Replace reads and writes in the `services/` folder with Supabase queries
4. Keep controllers and routes the same
