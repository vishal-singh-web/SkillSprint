// Simple in-memory data store for hackathon demos.
// Replace this file with Supabase queries when connecting a real database.

const mockDb = {
  dailyTasks: [
    {
      id: 1,
      title: "Solve 2 DSA problems",
      difficulty: "medium",
      completed: false,
    },
    {
      id: 2,
      title: "Improve one project README",
      difficulty: "easy",
      completed: false,
    },
    {
      id: 3,
      title: "Apply to 3 internships",
      difficulty: "medium",
      completed: false,
    },
  ],

  progress: {
    streak: 5,
    tasksCompleted: 12,
    skillScore: 68,
    interviewsCompleted: 3,
  },

  moodHistory: [],

  interviewHistory: [],
};

module.exports = mockDb;
