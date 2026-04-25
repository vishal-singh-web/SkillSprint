const express = require("express");
const { adjustMood } = require("../controllers/mood.controller");

const router = express.Router();

router.post("/", adjustMood);

module.exports = router;
