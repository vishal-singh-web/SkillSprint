const skillGapService = require("../services/skillgap.service");

const analyzeSkillGap = (req, res, next) => {
  try {
    const { resumeText } = req.body;

    if (!resumeText || typeof resumeText !== "string") {
      return res.status(400).json({
        success: false,
        message: "resumeText is required and must be a string",
      });
    }

    const result = skillGapService.analyzeResumeText(resumeText);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  analyzeSkillGap,
};
