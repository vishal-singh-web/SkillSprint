const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const skillGapRoutes = require("./routes/skillgap.routes");
const tasksRoutes = require("./routes/tasks.routes");
const moodRoutes = require("./routes/mood.routes");
const interviewRoutes = require("./routes/interview.routes");
const progressRoutes = require("./routes/progress.routes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS allows a separate HTML/CSS/JS or React frontend to call this backend.
app.use(cors());

// This lets Express read JSON request bodies.
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "SkillSprint 2026 backend is running",
    health: "ok",
  });
});

app.use("/api/skill-gap", skillGapRoutes);
app.use("/api/daily-tasks", tasksRoutes);
app.use("/api/mood", moodRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/progress", progressRoutes);

// Handles routes that do not exist.
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Central error handler for unexpected errors.
app.use((err, req, res, next) => {
  console.error("Server error:", err);

  res.status(500).json({
    success: false,
    message: "Something went wrong on the server",
  });
});

app.listen(PORT, () => {
  console.log(`SkillSprint 2026 backend running on port ${PORT}`);
});
