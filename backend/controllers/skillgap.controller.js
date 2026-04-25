const skillGapService = require("../services/skillgap.service");

const analyzeSkillGap = async (req, res, next) => {
  try {
    const { targetRole, resumeText } = req.body;

    if (!targetRole || typeof targetRole !== "string") {
      return res.status(400).json({
        success: false,
        message: "targetRole is required and must be a string",
      });
    }

    if (!resumeText || typeof resumeText !== "string") {
      return res.status(400).json({
        success: false,
        message: "resumeText is required and must be a string",
      });
    }

    const result = await skillGapService.analyzeResumeText({
      userId: req.user.id,
      targetRole,
      resumeText,
    });

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  analyzeSkillGap,
};
