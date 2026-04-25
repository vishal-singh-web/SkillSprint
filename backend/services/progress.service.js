const mockDb = require("../data/mockDb");

const getProgress = () => {
  return mockDb.progress;
};

const markTaskComplete = (taskId) => {
  const task = mockDb.dailyTasks.find((dailyTask) => dailyTask.id === taskId);

  if (!task) {
    return {
      success: false,
      message: "Task not found",
    };
  }

  if (!task.completed) {
    task.completed = true;
    mockDb.progress.tasksCompleted += 1;
    mockDb.progress.streak += 1;
    mockDb.progress.skillScore = Math.min(mockDb.progress.skillScore + 2, 100);
  }

  return {
    success: true,
    message: "Task marked complete",
    updatedProgress: {
      streak: mockDb.progress.streak,
      tasksCompleted: mockDb.progress.tasksCompleted,
      skillScore: mockDb.progress.skillScore,
    },
  };
};

module.exports = {
  getProgress,
  markTaskComplete,
};
