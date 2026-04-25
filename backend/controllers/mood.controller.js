const moodService = require("../services/mood.service");

const adjustMood = async (req, res, next) => {
  try {
    const { mood } = req.body;
    const allowedMoods = ["low", "neutral", "high"];

    if (!mood) {
      return res.status(400).json({
        success: false,
        message: "mood is required",
      });
    }

    if (!allowedMoods.includes(mood)) {
      return res.status(400).json({
        success: false,
        message: "mood must be one of: low, neutral, high",
      });
    }

    const result = await moodService.getMoodPlan({
      userId: req.user.id,
      mood,
    });

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  adjustMood,
};
