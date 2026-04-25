// Simple in-memory data store for hackathon demos.
// Replace this file with Supabase queries when connecting a real database.

const mockDb = {
  users: [
    {
      id: "user123",
      name: "Demo User",
      targetRole: "Frontend Developer",
      skills: ["HTML", "CSS", "JavaScript", "React"],
      skillScore: 62,
      streak: 4,
    },
  ],

  progress: [
    {
      userId: "user123",
      tasksCompleted: 12,
      interviewsCompleted: 2,
      completionRate: 70,
    },
  ],

  moodHistory: [
    {
      userId: "user123",
      mood: "low",
      date: "2026-04-24",
    },
    {
      userId: "user123",
      mood: "neutral",
      date: "2026-04-25",
    },
  ],

  tasks: [],

  skillGaps: [],

  interviewHistory: [],
};

module.exports = mockDb;
