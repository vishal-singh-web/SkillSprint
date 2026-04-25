const express = require("express");
const { analyzeSkillGap } = require("../controllers/skillgap.controller");

const router = express.Router();

router.post("/", analyzeSkillGap);

module.exports = router;
