const supabase = require("../config/supabase");

const getProgress = async (userId) => {
  const [{ data: profile }, { data: progress }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase.from("progress").select("*").eq("user_id", userId).maybeSingle(),
  ]);

  return {
    streak: profile?.streak || 0,
    tasksCompleted: progress?.tasks_completed || 0,
    skillScore: profile?.skill_score || 0,
    interviewsCompleted: progress?.interviews_completed || 0,
    completionRate: progress?.completion_rate || 0,
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

    const [{ data: progress }, { data: profile }] = await Promise.all([
      supabase
        .from("progress")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle(),
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    ]);

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

    if (profile) {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          streak: (profile.streak || 0) + 1,
          skill_score: Math.min((profile.skill_score || 0) + 2, 100),
        })
        .eq("id", userId);

      if (profileError) {
        throw profileError;
      }
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
