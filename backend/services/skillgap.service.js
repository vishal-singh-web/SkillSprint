const supabase = require("../config/supabase");
const { generateJSONPrompt } = require("./gemini.service");
const profileService = require("./profile.service");

const getLastTwoDaysISO = () => {
  const date = new Date();
  date.setDate(date.getDate() - 2);
  return date.toISOString();
};

const validateSkillGapResponse = (aiResult) => {
  const requiredArrays = [
    "detectedSkills",
    "strengths",
    "missingSkills",
    "projectSuggestions",
    "recommendedRoadmap",
    "daily3",
  ];

  const isValid = requiredArrays.every((key) => Array.isArray(aiResult?.[key]));

  if (!isValid) {
    const error = new Error("OpenRouter API error: invalid skill-gap JSON shape");
    error.statusCode = 502;
    throw error;
  }
};

const githubRepoToReadmeUrl = (repoUrl) => {
  try {
    const url = new URL(repoUrl.trim());

    if (url.hostname !== "github.com") {
      return null;
    }

    const [owner, repo] = url.pathname.split("/").filter(Boolean);

    if (!owner || !repo) {
      return null;
    }

    return `https://raw.githubusercontent.com/${owner}/${repo.replace(
      /\.git$/,
      ""
    )}/main/README.md`;
  } catch {
    return null;
  }
};

const fetchGithubReadme = async (repoUrl) => {
  const readmeUrl = githubRepoToReadmeUrl(repoUrl);

  if (!readmeUrl) {
    const error = new Error("Please paste a valid GitHub repository URL");
    error.statusCode = 400;
    throw error;
  }

  const response = await fetch(readmeUrl);

  if (response.status === 404) {
    const error = new Error("README not found. Create a README, then paste again.");
    error.statusCode = 404;
    throw error;
  }

  if (!response.ok) {
    const error = new Error("Could not fetch GitHub README");
    error.statusCode = response.status;
    throw error;
  }

  return {
    readmeUrl,
    text: await response.text(),
  };
};

const buildSourceText = async ({ sourceType, resumeText, repoUrl, manualSkills }) => {
  if (sourceType === "github") {
    const readme = await fetchGithubReadme(repoUrl);
    return {
      sourceLabel: `GitHub README: ${readme.readmeUrl}`,
      text: readme.text,
    };
  }

  if (sourceType === "manual") {
    return {
      sourceLabel: "Manual skills",
      text: `Manual skills entered by user: ${(manualSkills || []).join(", ")}`,
    };
  }

  return {
    sourceLabel: "Resume text",
    text: resumeText,
  };
};

const saveDaily3FromSkillGap = async ({ userId, daily3 }) => {
  const categories = ["DSA", "Project", "Application"];
  const taskBatchId = `skillgap-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
  const rows = (daily3 || []).slice(0, 3).map((task, index) => ({
    user_id: userId,
    task_batch_id: taskBatchId,
    title: typeof task === "string" ? task : task.title,
    description:
      typeof task === "string" ? task : task.description || task.title,
    category: categories[index] || "DSA",
    difficulty: "medium",
    estimated_time: "30 min",
    reason: "Generated from skill-gap analysis",
  }));

  if (rows.length === 0) {
    return;
  }

  const { error } = await supabase.from("daily_tasks").insert(rows);

  if (error) {
    throw error;
  }
};

const analyzeResumeText = async ({
  userId,
  targetRole,
  resumeText,
  sourceType = "resume",
  repoUrl,
  manualSkills,
}) => {
  const source = await buildSourceText({
    sourceType,
    resumeText,
    repoUrl,
    manualSkills,
  });

  const [{ data: profile }, { data: progress }, { data: moods }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase
        .from("progress")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle(),
      supabase
        .from("mood_history")
        .select("mood, created_at")
        .eq("user_id", userId)
        .gte("created_at", getLastTwoDaysISO())
        .order("created_at", { ascending: false }),
    ]);

  const prompt = `
Analyze this source for placement preparation and skill extraction.
Source type: ${sourceType}
Source label: ${source.sourceLabel}

Extract specific technical skills from the source. For GitHub README text, infer concrete skills from libraries, architecture, features, APIs, deployment, database, auth, AI, and tooling mentioned.
Compare the extracted/current skills with practical 2025-2026 Indian fresher hiring trends for the target role.
Do not generate today's task plan as an immediate UI instruction. The user will get updated Daily 3 tasks next time they generate tasks.

Target role: ${targetRole}
Current profile skills: ${JSON.stringify(profile?.skills || [])}
Profile: ${JSON.stringify(profile)}
Progress: ${JSON.stringify(progress)}
Mood last 2 days: ${JSON.stringify(moods || [])}
Source text: ${source.text}

Return this exact JSON shape:
{
  "detectedSkills": ["specific extracted skill"],
  "strengths": ["specific strength from source"],
  "missingSkills": ["specific missing skill for target role"],
  "projectSuggestions": ["specific project improvement"],
  "recommendedRoadmap": ["specific roadmap step for next few months"],
  "daily3": ["task idea for next generated plan", "task idea for next generated plan", "task idea for next generated plan"],
  "message": "Skills updated. Your next generated Daily 3 will use this analysis."
}
`;

  const aiResult = await generateJSONPrompt(prompt);
  validateSkillGapResponse(aiResult);

  const updatedProfile = await profileService.updateSkills({
    userId,
    skills: aiResult.detectedSkills,
  });

  const { error } = await supabase.from("skill_gap_reports").insert({
    user_id: userId,
    target_role: targetRole,
    strengths: aiResult.strengths,
    missing_skills: aiResult.missingSkills,
    project_suggestions: aiResult.projectSuggestions,
    recommended_roadmap: aiResult.recommendedRoadmap,
  });

  if (error) {
    throw error;
  }

  await saveDaily3FromSkillGap({ userId, daily3: aiResult.daily3 });

  return {
    ...aiResult,
    sourceType,
    updatedSkills: updatedProfile.skills,
    message:
      aiResult.message ||
      "Skills updated. Your next generated Daily 3 will use this analysis.",
  };
};

const getSkillGapHistory = async (userId) => {
  const { data, error } = await supabase
    .from("skill_gap_reports")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    throw error;
  }

  return (data || []).map((report) => ({
    id: report.id,
    targetRole: report.target_role,
    strengths: report.strengths || [],
    missingSkills: report.missing_skills || [],
    projectSuggestions: report.project_suggestions || [],
    recommendedRoadmap: report.recommended_roadmap || [],
    createdAt: report.created_at,
  }));
};

module.exports = {
  analyzeResumeText,
  getSkillGapHistory,
};
