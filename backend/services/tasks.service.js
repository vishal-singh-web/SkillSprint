const supabase = require("../config/supabase");
const { generateJSONPrompt } = require("./gemini.service");

const createTaskBatchId = () => {
  return `daily-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

const getTodayISO = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
};

const getLastTwoDaysISO = () => {
  const date = new Date();
  date.setDate(date.getDate() - 2);
  return date.toISOString();
};

const mapTask = (task) => ({
  id: task.id,
  taskBatchId: task.task_batch_id,
  title: task.title,
  description: task.description,
  category: task.category,
  difficulty: task.difficulty,
  estimatedTime: task.estimated_time,
  reason: task.reason,
  completed: task.completed,
  createdAt: task.created_at,
});

const saveTasks = async ({ userId, tasks }) => {
  if (!Array.isArray(tasks) || tasks.length !== 3) {
    const error = new Error("Gemini API error: expected exactly 3 tasks");
    error.statusCode = 502;
    throw error;
  }

  const hasInvalidTask = tasks.some((task) => {
    return (
      !task ||
      typeof task.title !== "string" ||
      typeof task.description !== "string" ||
      typeof task.category !== "string" ||
      typeof task.difficulty !== "string" ||
      typeof task.estimatedTime !== "string" ||
      typeof task.reason !== "string"
    );
  });

  if (hasInvalidTask) {
    const error = new Error("Gemini API error: invalid daily task JSON shape");
    error.statusCode = 502;
    throw error;
  }

  const taskBatchId = createTaskBatchId();

  const rows = tasks.slice(0, 3).map((task) => ({
    user_id: userId,
    task_batch_id: taskBatchId,
    title: task.title,
    description: task.description,
    category: task.category,
    difficulty: task.difficulty,
    estimated_time: task.estimatedTime,
    reason: task.reason,
  }));

  const { data, error } = await supabase
    .from("daily_tasks")
    .insert(rows)
    .select("*");

  if (error) {
    throw error;
  }

  return data.map(mapTask);
};

const getTodaysTasks = async (userId) => {
  const { data: latestTask, error: latestTaskError } = await supabase
    .from("daily_tasks")
    .select("task_batch_id, created_at")
    .eq("user_id", userId)
    .gte("created_at", getTodayISO())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestTaskError) {
    throw latestTaskError;
  }

  if (!latestTask) {
    return [];
  }

  let query = supabase
    .from("daily_tasks")
    .select("*")
    .eq("user_id", userId)
    .gte("created_at", getTodayISO())
    .order("created_at", { ascending: true })
    .limit(3);

  if (latestTask.task_batch_id) {
    query = query.eq("task_batch_id", latestTask.task_batch_id);
  } else {
    query = supabase
      .from("daily_tasks")
      .select("*")
      .eq("user_id", userId)
      .gte("created_at", getTodayISO())
      .order("created_at", { ascending: false })
      .limit(3);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data.map(mapTask).sort((a, b) => a.id - b.id);
};

const generateDailyTasks = async ({ userId, targetRole }) => {
  const [
    { data: profile },
    { data: latestSkillGap },
    { data: progress },
    { data: moodHistory },
    { data: completedTasks },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase
      .from("skill_gap_reports")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
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
    supabase
      .from("daily_tasks")
      .select("title, category, difficulty, completed, created_at")
      .eq("user_id", userId)
      .eq("completed", true)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const prompt = `
Generate exactly 3 personalized tasks:
1. One DSA/interview task
2. One project task
3. One job/application task

These 3 tasks must help close the user's latest skill gaps over the next few months.
Use the user's target role, skills, latest skill-gap report, progress, completed tasks, and mood from the last 2 days.
If mood has been low or negative for both of the last 2 days, make all tasks easier and shorter.
If mood is stable/high and completion rate is good, make tasks a little more challenging.
Do not repeat recently completed tasks.
Use current 2025-2026 Indian fresher hiring trends for the target role.
Keep each field short, specific, and action-based.

Target role: ${targetRole || profile?.target_role}
Skills: ${JSON.stringify(profile?.skills || [])}
Profile: ${JSON.stringify(profile)}
Latest skill gap report: ${JSON.stringify(latestSkillGap)}
Progress: ${JSON.stringify(progress)}
Mood last 2 days: ${JSON.stringify(moodHistory || [])}
Completed tasks: ${JSON.stringify(completedTasks || [])}

Return this exact JSON shape:
{
  "daily3": [
    {
      "title": "",
      "description": "",
      "category": "DSA",
      "difficulty": "easy",
      "estimatedTime": "30 min",
      "reason": ""
    }
  ]
}
`;

  const aiResult = await generateJSONPrompt(prompt);
  const savedTasks = await saveTasks({
    userId,
    tasks: aiResult.daily3,
  });

  return {
    daily3: savedTasks,
  };
};

module.exports = {
  getTodaysTasks,
  generateDailyTasks,
};
