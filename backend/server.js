const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

// Next is installed in the frontend app. This fallback lets the backend server
// load that same Next package when both apps live in one repo.
let next;
try {
  next = require("next");
} catch {
  next = require(path.join(__dirname, "../frontend/node_modules/next"));
}

const requireAuth = require("./middleware/auth.middleware");
const authRoutes = require("./routes/auth.routes");
const profileRoutes = require("./routes/profile.routes");
const skillGapRoutes = require("./routes/skillgap.routes");
const tasksRoutes = require("./routes/tasks.routes");
const moodRoutes = require("./routes/mood.routes");
const interviewRoutes = require("./routes/interview.routes");
const progressRoutes = require("./routes/progress.routes");
const agentRoutes = require("./routes/agent.routes");

const PORT = process.env.PORT || 5000;
const dev = process.env.NODE_ENV !== "production";
const frontendDir = path.join(__dirname, "../frontend");
const nextApp = next({ dev, dir: frontendDir });
const handle = nextApp.getRequestHandler();

nextApp.prepare().then(() => {
  const app = express();

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

  // Keep missing API routes as JSON errors instead of sending the frontend page.
  app.use("/api", (req, res) => {
    res.status(404).json({
      success: false,
      message: "API route not found",
    });
  });

  app.use((err, req, res, next) => {
    console.error("Server error:", err.message);

    res.status(err.statusCode || 500).json({
      success: false,
      message: err.statusCode ? err.message : "API error",
    });
  });

  // Let Next.js serve every non-API frontend route.
  app.all("*", (req, res) => {
    return handle(req, res);
  });

  app.listen(PORT, () => {
    console.log(`SkillSprint 2026 full-stack server running on port ${PORT}`);
  });
});
