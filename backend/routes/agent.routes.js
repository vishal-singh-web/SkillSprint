const express = require("express");
const { askAgent } = require("../controllers/agent.controller");

const router = express.Router();

router.post("/message", askAgent);

module.exports = router;
