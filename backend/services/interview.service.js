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

const hasUsefulTranscript = (transcript = []) => {
  const answerText = (transcript || [])
    .map((item) => `${item.answer || ""} ${item.code || ""}`.trim())
    .join(" ");

  return answerText.split(/\s+/).filter(Boolean).length >= 12;
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

const saveFinalInterview = async ({
  userId,
  targetRole,
  interviewType,
  questionCount,
  result,
}) => {
  const { error } = await supabase.from("interview_messages").insert({
    user_id: userId,
    target_role: targetRole,
    user_message: JSON.stringify({
      interviewType,
      questionCount,
      completed: true,
    }),
    ai_reply: "",
    feedback: [
      ...(result.overallGood || []).map((item) => `Good: ${item}`),
      ...(result.overallImprove || []).map((item) => `Improve: ${item}`),
    ].join(" | "),
    score: result.finalScore,
    improvement_tip: result.improvementTip,
  });

  if (error) {
    throw error;
  }

  await incrementInterviewProgress(userId);
};

const generateFinalReport = async ({
  userId,
  targetRole,
  interviewType,
  questionCount,
  transcript = [],
}) => {
  if (!hasUsefulTranscript(transcript)) {
    const result = {
      reply: "",
      feedback:
        "No meaningful answers were provided, so the interview cannot be scored positively.",
      score: 0,
      improvementTip:
        "Answer each question with a specific example, your actions, the tech or decision involved, and the result.",
      questionNumber: questionCount,
      isComplete: true,
      overallGood: ["You started the interview practice."],
      overallImprove: [
        "Provide complete answers before ending the interview.",
        "Use concrete examples instead of short or empty replies.",
      ],
      finalScore: 0,
    };

    await saveFinalInterview({
      userId,
      targetRole,
      interviewType,
      questionCount,
      result,
    });
    return result;
  }

  const prompt = `
Act as a brutally honest placement mock-interview evaluator.
Grade ONLY the interview transcript below. Do not give credit for profile, resume, project history, or skills unless the candidate clearly said them in the answers.
If an answer is vague, short, missing details, or avoids the question, penalize heavily.

Interview mode: ${interviewType === "hr" ? "HR Interview" : "Technical Interview"}
Target role: ${targetRole}
Expected question count: ${questionCount}
Transcript: ${JSON.stringify(transcript)}

Return this exact JSON shape:
{
  "reply": "",
  "feedback": "",
  "score": 0,
  "improvementTip": "",
  "questionNumber": ${questionCount},
  "isComplete": true,
  "overallGood": ["specific thing actually shown in answers"],
  "overallImprove": ["specific improvement from weak or missing answers"],
  "finalScore": 0
}
`;

  const result = await generateJSONPrompt(prompt);
  validateInterviewResponse(result);

  const normalized = {
    ...result,
    reply: "",
    isComplete: true,
    questionNumber: questionCount,
    finalScore: Math.max(0, Math.min(10, Math.round(result.finalScore))),
    score: 0,
    overallGood:
      result.overallGood.length > 0
        ? result.overallGood
        : ["You completed the interview attempt."],
    overallImprove:
      result.overallImprove.length > 0
        ? result.overallImprove
        : ["Add stronger examples, clearer structure, and more technical depth."],
  };

  await saveFinalInterview({
    userId,
    targetRole,
    interviewType,
    questionCount,
    result: normalized,
  });

  return normalized;
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
  transcript = [],
  isFinalReport = false,
}) => {
  if (isFinalReport) {
    return generateFinalReport({
      userId,
      targetRole,
      interviewType,
      questionCount,
      transcript,
    });
  }

  const [{ data: profile }, { data: latestSkillGap }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
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
Next question number to ask: ${questionNumber === 0 ? 1 : questionNumber + 1}.

Ask exactly one question. Do not score or evaluate the candidate yet.
Use the previous answers only to ask a relevant follow-up.
For HR interviews, focus on communication, behavior, projects, internships, strengths, weaknesses, teamwork, conflict, motivation, and role fit.
For technical interviews, focus on role-specific fundamentals, project architecture, debugging, APIs, database, frontend/backend concepts, DSA, and code reasoning. If code is provided, ask a code-related follow-up.

Target role: ${targetRole}
Profile skills for question personalization only: ${JSON.stringify(profile?.skills || [])}
Latest skill gap for question personalization only: ${JSON.stringify(latestSkillGap)}
Previous Q&A transcript: ${JSON.stringify(history)}
Candidate latest answer: ${message || ""}
Optional code submitted by candidate: ${code || ""}

Return this exact JSON shape:
{
  "reply": "",
  "feedback": "Answer this question to get feedback.",
  "score": 0,
  "improvementTip": "Feedback appears after the interview ends.",
  "questionNumber": ${questionNumber === 0 ? 1 : questionNumber + 1},
  "isComplete": false,
  "overallGood": [],
  "overallImprove": [],
  "finalScore": 0
}
`;

  const result = await generateJSONPrompt(prompt);
  validateInterviewResponse(result);

  return {
    ...result,
    feedback: "Answer this question to get feedback.",
    score: 0,
    improvementTip: "Feedback appears after the interview ends.",
    isComplete: false,
    overallGood: [],
    overallImprove: [],
    finalScore: 0,
  };
};

const getInterviewHistory = async (userId) => {
  const { data, error } = await supabase
    .from("interview_messages")
    .select("id, target_role, score, feedback, improvement_tip, created_at, user_message")
    .eq("user_id", userId)
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
