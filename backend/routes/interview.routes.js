const express = require("express");
const { sendInterviewMessage } = require("../controllers/interview.controller");

const router = express.Router();

router.post("/message", sendInterviewMessage);

module.exports = router;
