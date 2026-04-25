const supabase = require("../config/supabase");
const { generateJSONPrompt } = require("./gemini.service");

const getLastTwoDaysISO = () => {
  const date = new Date();
  date.setDate(date.getDate() - 2);
  return date.toISOString();
};

const validateSkillGapResponse = (aiResult) => {
  const requiredArrays = [
    "strengths",
    "missingSkills",
    "projectSuggestions",
    "recommendedRoadmap",
    "daily3",
  ];

  const isValid = requiredArrays.every((key) => Array.isArray(aiResult?.[key]));

  if (!isValid) {
    const error = new Error("Gemini API error: invalid skill-gap JSON shape");
    error.statusCode = 502;
    throw error;
  }
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

const analyzeResumeText = async ({ userId, targetRole, resumeText }) => {
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
Analyze this student's resume/project text for placement preparation.
Give real, personalized results. Do not return generic demo data.
Use the user's current skills, target role, resume/project text, progress, and last 2 days mood history.
Compare the user's skills with practical 2025-2026 Indian fresher hiring trends for this target role.
Consider what companies expect now: role-specific fundamentals, project quality, deployment, GitHub/README, DSA/interview readiness, internships, communication, and AI/tooling awareness when relevant.
Find exact skill gaps and project weaknesses from the resume text.
Daily3 should contain one DSA/interview task, one project improvement task, and one job/application task.
Keep arrays short but specific.

Target role: ${targetRole}
Skills: ${JSON.stringify(profile?.skills || [])}
Profile: ${JSON.stringify(profile)}
Progress: ${JSON.stringify(progress)}
Mood last 2 days: ${JSON.stringify(moods || [])}
Resume/project text: ${resumeText}

Return this exact JSON shape:
{
  "strengths": ["specific strength from profile or resume"],
  "missingSkills": ["specific skill missing for target role"],
  "projectSuggestions": ["specific project improvement"],
  "recommendedRoadmap": ["specific roadmap step for next few months"],
  "daily3": ["one DSA/interview task", "one project task", "one application task"]
}
`;

  const aiResult = await generateJSONPrompt(prompt);
  validateSkillGapResponse(aiResult);

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

  return aiResult;
};

module.exports = {
  analyzeResumeText,
};
