const supabase = require("../config/supabase");
const { generateJSONPrompt } = require("./gemini.service");

const askAgent = async ({ userId, question }) => {
  const [
    { data: profile },
    { data: progress },
    { data: latestSkillGap },
    { data: completedTasks },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase.from("progress").select("*").eq("user_id", userId).maybeSingle(),
    supabase
      .from("skill_gap_reports")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("daily_tasks")
      .select("title, category, completed")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const prompt = `
Answer the student's question as SkillSprint's placement coach.
Be short, direct, and personalized. Use the profile, skills, progress, latest skill gap, and completed tasks.

Question: ${question}
Profile: ${JSON.stringify(profile)}
Progress: ${JSON.stringify(progress)}
Latest skill gap: ${JSON.stringify(latestSkillGap)}
Recent tasks: ${JSON.stringify(completedTasks)}

Return this exact JSON shape:
{
  "reply": ""
}
`;

  const result = await generateJSONPrompt(prompt);

  if (!result?.reply || typeof result.reply !== "string") {
    const error = new Error("OpenRouter API error: invalid agent JSON shape");
    error.statusCode = 502;
    throw error;
  }

  return result;
};

module.exports = {
  askAgent,
};
