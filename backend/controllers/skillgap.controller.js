const skillGapService = require("../services/skillgap.service");

const analyzeSkillGap = async (req, res, next) => {
  try {
    const {
      targetRole,
      resumeText,
      sourceType = "resume",
      repoUrl,
      manualSkills,
    } = req.body;

    if (!targetRole || typeof targetRole !== "string") {
      return res.status(400).json({
        success: false,
        message: "targetRole is required and must be a string",
      });
    }

    if (sourceType === "resume" && (!resumeText || typeof resumeText !== "string")) {
      return res.status(400).json({
        success: false,
        message: "resumeText is required and must be a string",
      });
    }

    if (sourceType === "github" && (!repoUrl || typeof repoUrl !== "string")) {
      return res.status(400).json({
        success: false,
        message: "repoUrl is required for github analysis",
      });
    }

    if (sourceType === "manual" && !Array.isArray(manualSkills)) {
      return res.status(400).json({
        success: false,
        message: "manualSkills array is required for manual analysis",
      });
    }

    const result = await skillGapService.analyzeResumeText({
      userId: req.user.id,
      targetRole,
      resumeText,
      sourceType,
      repoUrl,
      manualSkills,
    });

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  analyzeSkillGap,
};
