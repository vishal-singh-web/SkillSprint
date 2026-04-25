const mockDb = require("../data/mockDb");

const getDailyTasks = () => {
  return mockDb.dailyTasks;
};

module.exports = {
  getDailyTasks,
};
