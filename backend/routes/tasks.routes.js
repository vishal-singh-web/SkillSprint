const express = require("express");
const {
  getDailyTasks,
  generateDailyTasks,
  completeTask,
} = require("../controllers/tasks.controller");

const router = express.Router();

router.get("/", getDailyTasks);
router.post("/generate", generateDailyTasks);
router.patch("/:taskId/complete", completeTask);

module.exports = router;
