const mockDb = require("../data/mockDb");

const moodPlans = {
  low: {
    difficulty: "easy",
    theme: "calm",
    message: "Let's keep it light today. Small progress is still progress.",
    adjustedDaily3: [
      "Revise one previous DSA problem",
      "Update one resume bullet",
      "Apply to one role",
    ],
  },
  neutral: {
    difficulty: "medium",
    theme: "focused",
    message: "Steady mode is perfect. Complete your core three tasks today.",
    adjustedDaily3: [
      "Solve 2 DSA problems",
      "Practice one interview answer",
      "Apply to 3 internships",
    ],
  },
  high: {
    difficulty: "hard",
    theme: "energetic",
    message: "Great energy. Push a little more and build momentum today.",
    adjustedDaily3: [
      "Solve 3 DSA problems with notes",
      "Build one small project feature",
      "Do a 20-minute mock interview",
    ],
  },
};

const getMoodPlan = (mood) => {
  const plan = moodPlans[mood];

  mockDb.moodHistory.push({
    mood,
    createdAt: new Date().toISOString(),
  });

  return {
    mood,
    ...plan,
  };
};

module.exports = {
  getMoodPlan,
};
