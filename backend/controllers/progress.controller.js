const progressService = require("../services/progress.service");

const getProgress = async (req, res, next) => {
  try {
    const progress = await progressService.getProgress(req.user.id);

    return res.status(200).json(progress);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProgress,
};
