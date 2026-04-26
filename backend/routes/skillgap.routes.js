const express = require("express");
const {
  analyzeSkillGap,
  getSkillGapHistory,
} = require("../controllers/skillgap.controller");

const router = express.Router();

router.get("/history", getSkillGapHistory);
router.post("/", analyzeSkillGap);

module.exports = router;
