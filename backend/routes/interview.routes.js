const express = require("express");
const {
  sendInterviewMessage,
  getInterviewHistory,
} = require("../controllers/interview.controller");

const router = express.Router();

router.get("/history", getInterviewHistory);
router.post("/message", sendInterviewMessage);

module.exports = router;
