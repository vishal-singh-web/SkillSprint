const tasksService = require("../services/tasks.service");

const getDailyTasks = (req, res, next) => {
  try {
    const daily3 = tasksService.getDailyTasks();

    return res.status(200).json({ daily3 });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDailyTasks,
};
