const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const requireAuth = require("./middleware/auth.middleware");
const authRoutes = require("./routes/auth.routes");
const profileRoutes = require("./routes/profile.routes");
const skillGapRoutes = require("./routes/skillgap.routes");
const tasksRoutes = require("./routes/tasks.routes");
const moodRoutes = require("./routes/mood.routes");
const interviewRoutes = require("./routes/interview.routes");
const progressRoutes = require("./routes/progress.routes");
const agentRoutes = require("./routes/agent.routes");

const app = express();
const PORT = process.env.PORT || 5000;

// Allows your frontend app to call this backend.
app.use(cors());

// Allows Express to read JSON request bodies.
app.use(express.json());

// Only health check is public.
app.get("/health", (req, res) => {
  res.json({
    message: "SkillSprint 2026 backend is running",
    health: "ok",
  });
});

// Signup and login are public. /me and /logout are protected inside auth.routes.js.
app.use("/api/auth", authRoutes);

// All user-specific API routes below require a valid Supabase JWT.
app.use("/api/profile", requireAuth, profileRoutes);
app.use("/api/skill-gap", requireAuth, skillGapRoutes);
app.use("/api/daily-tasks", requireAuth, tasksRoutes);
app.use("/api/mood", requireAuth, moodRoutes);
app.use("/api/interview", requireAuth, interviewRoutes);
app.use("/api/progress", requireAuth, progressRoutes);
app.use("/api/agent", requireAuth, agentRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use((err, req, res, next) => {
  console.error("Server error:", err.message);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.statusCode ? err.message : "API error",
  });
});

app.listen(PORT, () => {
  console.log(`SkillSprint 2026 backend running on port ${PORT}`);
});
