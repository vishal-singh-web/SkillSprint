const supabase = require("../config/supabase");
const { generateJSONPrompt } = require("./gemini.service");

const validateInterviewResponse = (aiResult) => {
  const isValid =
    aiResult &&
    typeof aiResult.reply === "string" &&
    typeof aiResult.feedback === "string" &&
    typeof aiResult.improvementTip === "string" &&
    typeof aiResult.score === "number" &&
    typeof aiResult.questionNumber === "number" &&
    typeof aiResult.isComplete === "boolean" &&
    Array.isArray(aiResult.overallGood) &&
    Array.isArray(aiResult.overallImprove) &&
    typeof aiResult.finalScore === "number";

  if (!isValid) {
    const error = new Error("OpenRouter API error: invalid interview JSON shape");
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

const generateInterviewReply = async ({
  userId,
  targetRole,
  interviewType,
  questionCount,
  message,
  code,
  questionNumber = 0,
  history = [],
}) => {
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
Interview mode: ${interviewType === "hr" ? "HR Interview" : "Technical Interview"}.
Total questions requested: ${questionCount}.
Current answered question number: ${questionNumber}.

Ask exactly one question at a time.
If current answered question number is 0, start the interview by asking question 1. Do not score yet; return score 0, feedback "Answer this question to get feedback.", and improvementTip "Feedback appears after your answer."
If current answered question number is less than total questions requested, give feedback for the answer, then ask the next question.
If current answered question number is equal to total questions requested, this is the final answer. Do not ask another question. Give final short feedback, overallGood, overallImprove, finalScore, and set isComplete true.
For HR interviews, focus on communication, behavior, projects, internships, strengths, weaknesses, teamwork, conflict, motivation, and role fit.
For technical interviews, focus on role-specific fundamentals, project architecture, debugging, APIs, database, frontend/backend concepts, DSA, and code reasoning. If code is provided, review it briefly and ask one follow-up.
Do not be generic.

Target role: ${targetRole}
Profile: ${JSON.stringify(profile)}
Progress: ${JSON.stringify(progress)}
Latest skill gap: ${JSON.stringify(latestSkillGap)}
Interview history: ${JSON.stringify(history)}
Candidate answer: ${message}
Optional code submitted by candidate: ${code || ""}

Return this exact JSON shape:
{
  "reply": "",
  "feedback": "",
  "score": 7,
  "improvementTip": "",
  "questionNumber": ${questionNumber === 0 ? 1 : questionNumber + 1},
  "isComplete": false,
  "overallGood": [],
  "overallImprove": [],
  "finalScore": 0
}
`;

  const aiResult = await generateJSONPrompt(prompt);
  validateInterviewResponse(aiResult);

  const { error } = await supabase.from("interview_messages").insert({
    user_id: userId,
    target_role: targetRole,
    user_message: JSON.stringify({
      interviewType,
      questionCount,
      questionNumber,
      message,
      code: code || "",
    }),
    ai_reply: aiResult.reply,
    feedback: aiResult.feedback,
    score: aiResult.score,
    improvement_tip: aiResult.improvementTip,
  });

  if (error) {
    throw error;
  }

  if (aiResult.isComplete) {
    await incrementInterviewProgress(userId);
  }

  return aiResult;
};

const getInterviewHistory = async (userId) => {
  const { data, error } = await supabase
    .from("interview_messages")
    .select("id, target_role, score, feedback, improvement_tip, created_at, user_message")
    .eq("user_id", userId)
    .gt("score", 0)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) throw error;

  return (data || []).map((item) => {
    let meta = {};
    try {
      meta = JSON.parse(item.user_message || "{}");
    } catch {}

    return {
      id: item.id,
      targetRole: item.target_role,
      interviewType: meta.interviewType || "interview",
      questionNumber: meta.questionNumber || null,
      score: item.score,
      feedback: item.feedback,
      improvementTip: item.improvement_tip,
      createdAt: item.created_at,
    };
  });
};

module.exports = {
  generateInterviewReply,
  getInterviewHistory,
};
