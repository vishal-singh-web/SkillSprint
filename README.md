# 🚀 SkillSprint 2026

**SkillSprint 2026** is an AI-powered placement preparation platform that helps students prepare smarter through personalized guidance, skill-gap analysis, adaptive daily tasks, AI interviews, and progress tracking.

Instead of overwhelming students with generic resources, SkillSprint acts as a personal AI placement coach that provides clear daily direction based on the user's skills, target role, progress, and mood.

---

## 🎯 Problem Statement

Students preparing for placements often face:

* Analysis paralysis due to too many resources
* Lack of personalized guidance
* Unclear preparation roadmap
* Limited interview practice
* Difficulty tracking progress

Most existing platforms provide content but do not actively guide students on what to do next.

---

## 💡 Solution

SkillSprint 2026 analyzes the current job market, compares it with the user's skills and goals, and generates personalized recommendations to help students become placement-ready.

The platform continuously adapts based on:

* Skills
* Resume
* GitHub Projects
* Target Role
* Progress
* Mood History

---

## ✨ Features

### 🔍 AI Skill-Gap Scanner

Users can:

* Paste their Resume
* Paste their GitHub Repository
* Enter Skills Manually

The system provides:

* Strengths Analysis
* Missing Skills
* Project Improvement Suggestions
* Personalized Roadmap

It also maintains **Skill-Gap History** so users can track their growth over time.

---

### 📈 Market-Aware Daily 3 Tasks

SkillSprint scans job market requirements and generates **3 personalized daily tasks** based on:

* Current Skills
* Target Role
* Progress
* Mood
* Skill Gap Analysis

Task Categories:

* DSA / Interview Preparation
* Project Improvement
* Applications / Career Growth

---

### 😊 Mood-Aware Preparation

Users can select their mood daily.

If a user selects **Low Mood for 2 consecutive days**, SkillSprint automatically adjusts difficulty and generates easier tasks on the third day to maintain consistency and reduce burnout.

---

### 🎤 AI Interview Simulator

Supports:

#### HR Interview

* Behavioral Questions
* Communication Assessment

#### Technical Interview

* Technical Questions
* Coding Questions
* Code Editor Support

Interview Length Options:

* 2 Questions
* 5–7 Questions
* 9+ Questions

At the end of every interview, users receive:

* Final Score
* Strengths
* Areas for Improvement
* Personalized Feedback

Interview Score History is also maintained.

---

### 📊 Progress Dashboard

Track:

* Readiness Score
* Daily Streak
* Task Completion Progress
* Mood History
* Skills Overview

This helps users understand how close they are to becoming placement-ready.

---

### 🤖 AI Career Agent

SkillSprint includes an AI Agent that provides real-time guidance.

Users can ask:

* What should I improve?
* What skills am I missing?
* Am I ready for interviews?
* What should I focus on next?

The agent uses the user's latest data to provide personalized recommendations.

---

## 🛠️ Tech Stack

### Frontend

* Next.js
* JavaScript
* HTML
* CSS

### Backend

* Node.js
* Express.js

### Database & Authentication

* Supabase

### AI

* Gemini AI

### Development Tools

* Replit (UI Prototyping)
* Codex (API Logic)
* ChatGPT (Planning, Development, Debugging, UI Improvements, Documentation)

---

## 🔄 User Flow

1. Create Account / Login
2. Complete Profile Setup
3. Run Skill-Gap Analysis
4. Generate Personalized Daily 3 Tasks
5. Track Mood & Progress
6. Practice with AI Interviews
7. Improve Based on Feedback
8. Become Placement Ready

---

## 🚀 Installation

### Clone Repository

```bash
git clone https://github.com/vishal-singh-web/SkillSprint.git
cd SkillSprint
```

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```env
PORT=5000

SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

GEMINI_API_KEY=
```

Run backend:

```bash
npm start
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 🔐 Environment Variables

```env
PORT=5000

SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

GEMINI_API_KEY=
```

---

## 👥 Team Node Knights

### Team Members

* Vishal
* Preeti
* Neha
* Akshat

---

## 🎯 Future Improvements

* Resume Scoring System
* Company-Specific Interview Preparation
* Placement Analytics
* AI Learning Paths
* Community Features
* Recruiter Insights

---

## 📜 License

This project was built as part of a hackathon project and is intended for educational and demonstration purposes.

---

### From Confusion to Placement-Ready 🚀

**SkillSprint 2026** helps students prepare smarter, stay consistent, and build confidence through personalized AI-driven guidance.
