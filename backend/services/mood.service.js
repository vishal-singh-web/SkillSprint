const supabase = require("../config/supabase");

const getMoodHistory = async (userId) => {
  const { data, error } = await supabase
    .from("mood_history")
    .select("id, mood, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(14);

  if (error) {
    throw error;
  }

  return (data || []).map((entry) => ({
    id: entry.id,
    mood: entry.mood,
    createdAt: entry.created_at,
  }));
};

const recordMood = async ({ userId, mood }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: existingMood, error: findError } = await supabase
    .from("mood_history")
    .select("id")
    .eq("user_id", userId)
    .gte("created_at", today.toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (findError) {
    throw findError;
  }

  const query = existingMood
    ? supabase.from("mood_history").update({ mood }).eq("id", existingMood.id)
    : supabase.from("mood_history").insert({ user_id: userId, mood });

  const { error } = await query;

  if (error) {
    throw error;
  }

  const moodHistory = await getMoodHistory(userId);

  return {
    message: "Mood recorded",
    mood,
    moodHistory,
  };
};

module.exports = {
  recordMood,
  getMoodHistory,
};
