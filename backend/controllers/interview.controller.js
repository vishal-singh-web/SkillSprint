const interviewService = require("../services/interview.service");

const sendInterviewMessage = (req, res, next) => {
  try {
    const { role, message } = req.body;

    if (!role || typeof role !== "string") {
      return res.status(400).json({
        success: false,
        message: "role is required and must be a string",
      });
    }

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        success: false,
        message: "message is required and must be a string",
      });
    }

    const result = interviewService.generateInterviewReply(role, message);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendInterviewMessage,
};
