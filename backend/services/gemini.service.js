const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const cleanAIText = (text) => {
  return String(text || "")
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
};

const parseJSONSafely = (text) => {
  const cleanedText = cleanAIText(text);

  try {
    return JSON.parse(cleanedText);
  } catch (error) {
    // Extra safety if a model accidentally adds text around the JSON.
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

const getOpenRouterKey = () => {
  return process.env.OPEN_ROUTER_API_KEY || process.env.OPENROUTER_API_KEY;
};

const generateJSONPrompt = async (prompt) => {
  try {
    const apiKey = getOpenRouterKey();

    if (!apiKey || apiKey.trim() === "") {
      throw createApiError(
        "OpenRouter API error: OPEN_ROUTER_API_KEY is missing"
      );
    }

    const systemPrompt = `
You are an AI placement prep coach for Indian 2026 engineering students.
Return ONLY valid JSON. No markdown. No explanation.
Do not reuse generic demo answers. Personalize using every user detail provided.
Use practical 2025-2026 Indian fresher hiring expectations for the target role, including role-specific skills, portfolio quality, DSA/interview readiness, internships, GitHub, deployment, communication, and application consistency.
`;

    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.APP_URL || "http://localhost:3000",
        "X-Title": "SkillSprint 2026",
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || "openrouter/free",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.9,
        response_format: {
          type: "json_object",
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const message =
        data?.error?.message || data?.message || "OpenRouter request failed";
      throw createApiError(`OpenRouter API error: ${message}`, response.status);
    }

    const content = data?.choices?.[0]?.message?.content;
    const parsed = parseJSONSafely(content);

    if (!parsed) {
      throw createApiError("OpenRouter API error: invalid JSON response");
    }

    return parsed;
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }

    throw createApiError(`OpenRouter API error: ${error.message}`);
  }
};

module.exports = {
  generateJSONPrompt,
};
