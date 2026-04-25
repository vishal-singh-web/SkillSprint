const tasksService = require("../services/tasks.service");
const progressService = require("../services/progress.service");

const getDailyTasks = async (req, res, next) => {
  try {
    const daily3 = await tasksService.getTodaysTasks(req.user.id);

    return res.status(200).json({ daily3 });
  } catch (error) {
    next(error);
  }
};

const generateDailyTasks = async (req, res, next) => {
  try {
    const { targetRole } = req.body;

    if (!targetRole || typeof targetRole !== "string") {
      return res.status(400).json({
        success: false,
        message: "targetRole is required and must be a string",
      });
    }

    const result = await tasksService.generateDailyTasks({
      userId: req.user.id,
      targetRole,
    });

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const completeTask = async (req, res, next) => {
  try {
    const taskId = Number(req.params.taskId);

    if (!taskId) {
      return res.status(400).json({
        success: false,
        message: "taskId route parameter is required",
      });
    }

    const result = await progressService.markTaskComplete({
      userId: req.user.id,
      taskId,
    });

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDailyTasks,
  generateDailyTasks,
  completeTask,
};
