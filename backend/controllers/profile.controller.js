const profileService = require("../services/profile.service");

const createOrUpdateProfile = async (req, res, next) => {
  try {
    const { name, targetRole, skills } = req.body;

    if (!name || typeof name !== "string") {
      return res.status(400).json({
        success: false,
        message: "name is required and must be a string",
      });
    }

    if (!targetRole || typeof targetRole !== "string") {
      return res.status(400).json({
        success: false,
        message: "targetRole is required and must be a string",
      });
    }

    if (!Array.isArray(skills)) {
      return res.status(400).json({
        success: false,
        message: "skills is required and must be an array",
      });
    }

    const profile = await profileService.upsertProfile({
      userId: req.user.id,
      email: req.user.email,
      name,
      targetRole,
      skills,
    });

    return res.status(200).json({ profile });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const profile = await profileService.getProfile(req.user.id);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    return res.status(200).json({ profile });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrUpdateProfile,
  getProfile,
};
