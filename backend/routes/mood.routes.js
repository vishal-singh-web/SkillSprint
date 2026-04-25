const express = require("express");
const {
  adjustMood,
  getMoodHistory,
} = require("../controllers/mood.controller");

const router = express.Router();

router.get("/", getMoodHistory);
router.post("/", adjustMood);

module.exports = router;
