const interviewService = require("../services/interview.service");

const sendInterviewMessage = async (req, res, next) => {
  try {
    const {
      targetRole,
      interviewType,
      questionCount,
      message,
      code,
      questionNumber,
      history,
    } = req.body;

    if (!targetRole || typeof targetRole !== "string") {
      return res.status(400).json({
        success: false,
        message: "targetRole is required and must be a string",
      });
    }

    if (!interviewType || !["hr", "technical"].includes(interviewType)) {
      return res.status(400).json({
        success: false,
        message: "interviewType must be hr or technical",
      });
    }

    if (!questionCount || typeof questionCount !== "number") {
      return res.status(400).json({
        success: false,
        message: "questionCount is required and must be a number",
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
      interviewType,
      questionCount,
      message,
      code,
      questionNumber,
      history,
    });

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getInterviewHistory = async (req, res, next) => {
  try {
    const history = await interviewService.getInterviewHistory(req.user.id);
    return res.status(200).json({ history });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendInterviewMessage,
  getInterviewHistory,
};
