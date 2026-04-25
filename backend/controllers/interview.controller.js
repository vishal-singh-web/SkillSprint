const interviewService = require("../services/interview.service");

const sendInterviewMessage = async (req, res, next) => {
  try {
    const { targetRole, message } = req.body;

    if (!targetRole || typeof targetRole !== "string") {
      return res.status(400).json({
        success: false,
        message: "targetRole is required and must be a string",
      });
    }

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        success: false,
        message: "message is required and must be a string",
      });
    }

    const result = await interviewService.generateInterviewReply({
      userId: req.user.id,
      targetRole,
      message,
    });

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendInterviewMessage,
};
