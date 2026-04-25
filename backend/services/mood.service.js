const supabase = require("../config/supabase");
const { generateJSONPrompt } = require("./gemini.service");

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

const validateMoodResponse = (aiResult) => {
  const isValid =
    aiResult &&
    typeof aiResult.mood === "string" &&
    typeof aiResult.difficulty === "string" &&
    typeof aiResult.theme === "string" &&
    typeof aiResult.message === "string" &&
    Array.isArray(aiResult.adjustedDaily3);

  if (!isValid) {
    const error = new Error("Gemini API error: invalid mood JSON shape");
    error.statusCode = 502;
    throw error;
  }
};

const getMoodPlan = async ({ userId, mood }) => {
  const { error: insertError } = await supabase.from("mood_history").insert({
    user_id: userId,
    mood,
  });

  if (insertError) {
    throw insertError;
  }

  const [{ data: moodHistory }, { data: tasks }, { data: profile }] =
    await Promise.all([
      supabase
        .from("mood_history")
        .select("mood, created_at")
        .eq("user_id", userId)
        .gte("created_at", getLastTwoDaysISO())
        .order("created_at", { ascending: false }),
      supabase
        .from("daily_tasks")
        .select("title, category, difficulty, completed")
        .eq("user_id", userId)
        .gte("created_at", getTodayISO())
        .order("created_at", { ascending: true }),
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    ]);

  const prompt = `
Adjust today's Daily 3 tasks based on the student's current mood.
Use last 2 days mood history and current tasks. If the user has low mood for 2 days, make tasks easier and smaller.
Keep the message short, practical, and motivating.

Profile: ${JSON.stringify(profile)}
Current mood: ${mood}
Mood last 2 days: ${JSON.stringify(moodHistory || [])}
Today's tasks: ${JSON.stringify(tasks || [])}

Return this exact JSON shape:
{
  "mood": "${mood}",
  "difficulty": "easy",
  "theme": "calm",
  "message": "",
  "adjustedDaily3": []
}
`;

  const aiResult = await generateJSONPrompt(prompt);
  validateMoodResponse(aiResult);

  return aiResult;
};

module.exports = {
  getMoodPlan,
};
