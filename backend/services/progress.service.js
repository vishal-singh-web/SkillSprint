const supabase = require("../config/supabase");
const { generateJSONPrompt } = require("./gemini.service");

const toDateKey = (value) => new Date(value).toISOString().slice(0, 10);

const calculateStreak = async (userId) => {
  const { data: tasks, error } = await supabase
    .from("daily_tasks")
    .select("created_at")
    .eq("user_id", userId)
    .eq("completed", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (!tasks || tasks.length === 0) return 0;

  const completedDays = new Set(tasks.map((task) => toDateKey(task.created_at)));
  const cursor = new Date();
  let streak = 0;

  while (completedDays.has(toDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
};

const calculateReadinessScore = async ({ profile, progress, streak }) => {
  const prompt = `
Decide a placement readiness score for this student from 0 to 100.
Use target role, skills, progress, completion rate, interview count, and streak.
Be realistic for Indian 2026 engineering placement prep.

Profile: ${JSON.stringify(profile)}
Progress: ${JSON.stringify(progress)}
Current continuous streak: ${streak}

Return this exact JSON shape:
{
  "readinessScore": 72,
  "readinessReason": ""
}
`;

  const result = await generateJSONPrompt(prompt);

  if (
    typeof result?.readinessScore !== "number" ||
    typeof result?.readinessReason !== "string"
  ) {
    const error = new Error("OpenRouter API error: invalid readiness JSON shape");
    error.statusCode = 502;
    throw error;
  }

  return result;
};

const getProgress = async (userId) => {
  const [{ data: profile }, { data: progress }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase.from("progress").select("*").eq("user_id", userId).maybeSingle(),
  ]);

  const streak = await calculateStreak(userId);
  const readiness = await calculateReadinessScore({ profile, progress, streak });

  return {
    streak,
    tasksCompleted: progress?.tasks_completed || 0,
    interviewsCompleted: progress?.interviews_completed || 0,
    completionRate: progress?.completion_rate || 0,
    readinessScore: readiness.readinessScore,
    readinessReason: readiness.readinessReason,
  };
};

const calculateCompletionRate = async (userId) => {
  const { data: tasks, error } = await supabase
    .from("daily_tasks")
    .select("completed")
    .eq("user_id", userId);

  if (error) {
    throw error;
  }

  if (!tasks || tasks.length === 0) {
    return 0;
  }

  const completed = tasks.filter((task) => task.completed).length;
  return Math.round((completed / tasks.length) * 100);
};

const markTaskComplete = async ({ userId, taskId }) => {
  const { data: task, error: taskError } = await supabase
    .from("daily_tasks")
    .select("*")
    .eq("id", taskId)
    .eq("user_id", userId)
    .maybeSingle();

  if (taskError) {
    throw taskError;
  }

  if (!task) {
    return {
      success: false,
      message: "Task not found",
    };
  }

  if (!task.completed) {
    const { error: updateTaskError } = await supabase
      .from("daily_tasks")
      .update({ completed: true })
      .eq("id", taskId)
      .eq("user_id", userId);

    if (updateTaskError) {
      throw updateTaskError;
    }

    const { data: progress } = await supabase
      .from("progress")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    const completionRate = await calculateCompletionRate(userId);

    const { error: progressError } = await supabase.from("progress").upsert(
      {
        user_id: userId,
        tasks_completed: (progress?.tasks_completed || 0) + 1,
        interviews_completed: progress?.interviews_completed || 0,
        completion_rate: completionRate,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    if (progressError) {
      throw progressError;
    }
  }

  return {
    success: true,
    message: "Task marked complete",
    updatedProgress: await getProgress(userId),
  };
};

module.exports = {
  getProgress,
  markTaskComplete,
};
