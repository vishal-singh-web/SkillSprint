const express = require("express");
const {
  getProgress,
  completeTask,
} = require("../controllers/progress.controller");

const router = express.Router();

router.get("/", getProgress);
router.post("/task-complete", completeTask);

module.exports = router;
