const express = require("express");
const { getDailyTasks } = require("../controllers/tasks.controller");

const router = express.Router();

router.get("/", getDailyTasks);

module.exports = router;
