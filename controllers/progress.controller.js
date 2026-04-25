const progressService = require("../services/progress.service");

const getProgress = (req, res, next) => {
  try {
    const progress = progressService.getProgress();

    return res.status(200).json(progress);
  } catch (error) {
    next(error);
  }
};

const completeTask = (req, res, next) => {
  try {
    const { taskId } = req.body;

    if (!taskId || typeof taskId !== "number") {
      return res.status(400).json({
        success: false,
        message: "taskId is required and must be a number",
      });
    }

    const result = progressService.markTaskComplete(taskId);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProgress,
  completeTask,
};
