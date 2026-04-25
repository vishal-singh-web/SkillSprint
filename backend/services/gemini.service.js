const { GoogleGenerativeAI } = require("@google/generative-ai");

const cleanGeminiText = (text) => {
  return String(text || "")
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
};

const parseJSONSafely = (text) => {
  const cleanedText = cleanGeminiText(text);

  try {
    return JSON.parse(cleanedText);
  } catch (error) {
    // Extra safety if the model accidentally adds text around JSON.
    const firstBrace = cleanedText.indexOf("{");
    const lastBrace = cleanedText.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1) {
      return null;
    }

    try {
      return JSON.parse(cleanedText.slice(firstBrace, lastBrace + 1));
    } catch (nestedError) {
      return null;
    }
  }
};

const createApiError = (message, statusCode = 502) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const generateJSONPrompt = async (prompt) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey.trim() === "") {
      throw createApiError("Gemini API error: GEMINI_API_KEY is missing");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.9,
      },
    });

    const finalPrompt = `
You are an AI placement prep coach for Indian 2026 engineering students.
Return ONLY valid JSON. No markdown. No explanation.
Do not reuse generic demo answers. Personalize using every user detail provided.
Use practical 2025-2026 Indian fresher hiring expectations for the target role, including role-specific skills, portfolio quality, DSA/interview readiness, internships, GitHub, deployment, communication, and application consistency.

${prompt}
`;

    const result = await model.generateContent(finalPrompt);
    const parsed = parseJSONSafely(result.response.text());

    if (!parsed) {
      throw createApiError("Gemini API error: invalid JSON response");
    }

    return parsed;
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }

    throw createApiError(`Gemini API error: ${error.message}`);
  }
};

module.exports = {
  generateJSONPrompt,
};
