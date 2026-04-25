const express = require("express");
const { getProgress } = require("../controllers/progress.controller");

const router = express.Router();

router.get("/", getProgress);

module.exports = router;
