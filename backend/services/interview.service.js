const supabase = require("../config/supabase");
const { generateJSONPrompt } = require("./gemini.service");

const validateInterviewResponse = (aiResult) => {
  const isValid =
    aiResult &&
    typeof aiResult.reply === "string" &&
    typeof aiResult.feedback === "string" &&
    typeof aiResult.improvementTip === "string" &&
    typeof aiResult.score === "number";

  if (!isValid) {
    const error = new Error("Gemini API error: invalid interview JSON shape");
    error.statusCode = 502;
    throw error;
  }
};

const incrementInterviewProgress = async (userId) => {
  const { data: progress, error } = await supabase
    .from("progress")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  const nextCount = (progress?.interviews_completed || 0) + 1;

  const { error: upsertError } = await supabase.from("progress").upsert(
    {
      user_id: userId,
      interviews_completed: nextCount,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (upsertError) {
    throw upsertError;
  }
};

const generateInterviewReply = async ({ userId, targetRole, message }) => {
  const [{ data: profile }, { data: progress }, { data: latestSkillGap }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase
        .from("progress")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle(),
      supabase
        .from("skill_gap_reports")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

  const prompt = `
Act as a realistic mock interviewer.
Read the candidate response carefully.
Ask one role-specific follow-up interview question.
Give one concise feedback line.
Give a realistic score out of 10.
Give one specific improvement tip.
Do not be generic.

Target role: ${targetRole}
Profile: ${JSON.stringify(profile)}
Progress: ${JSON.stringify(progress)}
Latest skill gap: ${JSON.stringify(latestSkillGap)}
Candidate message: ${message}

Return this exact JSON shape:
{
  "reply": "",
  "feedback": "",
  "score": 7,
  "improvementTip": ""
}
`;

  const aiResult = await generateJSONPrompt(prompt);
  validateInterviewResponse(aiResult);

  const { error } = await supabase.from("interview_messages").insert({
    user_id: userId,
    target_role: targetRole,
    user_message: message,
    ai_reply: aiResult.reply,
    feedback: aiResult.feedback,
    score: aiResult.score,
    improvement_tip: aiResult.improvementTip,
  });

  if (error) {
    throw error;
  }

  await incrementInterviewProgress(userId);

  return aiResult;
};

module.exports = {
  generateInterviewReply,
};
