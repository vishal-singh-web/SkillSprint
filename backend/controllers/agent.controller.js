const agentService = require("../services/agent.service");

const askAgent = async (req, res, next) => {
  try {
    const { question } = req.body;

    if (!question || typeof question !== "string") {
      return res.status(400).json({
        success: false,
        message: "question is required",
      });
    }

    const result = await agentService.askAgent({
      userId: req.user.id,
      question,
    });

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  askAgent,
};
