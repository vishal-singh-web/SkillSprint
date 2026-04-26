const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const cleanAIText = (text) => {
  return String(text || "")
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
};

const normalizeContent = (content) => {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") return part;
        return part?.text || part?.content || "";
      })
      .join("");
  }

  return "";
};

const extractBalancedJSON = (text) => {
  const start = text.search(/[\[{]/);
  if (start === -1) return null;

  const stack = [];
  let inString = false;
  let escaped = false;

  for (let index = start; index < text.length; index += 1) {
    const char = text[index];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === "\\") {
      escaped = true;
      continue;
    }

    if (char === "\"") {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (char === "{" || char === "[") {
      stack.push(char);
    }

    if (char === "}" || char === "]") {
      const expected = char === "}" ? "{" : "[";
      if (stack.pop() !== expected) return null;

      if (stack.length === 0) {
        return text.slice(start, index + 1);
      }
    }
  }

  return null;
};

const parseJSONSafely = (text) => {
  const cleanedText = cleanAIText(text);

  try {
    return JSON.parse(cleanedText);
  } catch (error) {
    const extractedJSON = extractBalancedJSON(cleanedText);

    if (!extractedJSON) {
      return null;
    }

    try {
      return JSON.parse(extractedJSON);
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

const getOpenRouterKeys = () => {
  const keys = [
    process.env.OPEN_ROUTER_API_KEY1,
    process.env.OPEN_ROUTER_API_KEY2,
    process.env.OPEN_ROUTER_API_KEY3,
    process.env.OPEN_ROUTER_API_KEY4,
    process.env.OPEN_ROUTER_API_KEY5,
    process.env.OPEN_ROUTER_API_KEY6,
    process.env.OPEN_ROUTER_API_KEY7,
  ]
    .map((key) => String(key || "").trim())
    .filter(Boolean);

  return Array.from(new Set(keys));
};

const callOpenRouter = async ({ apiKey, prompt, temperature }) => {
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
      temperature,
      max_tokens: 1200,
      response_format: {
        type: "json_object",
      },
    }),
  });

  const rawText = await response.text();
  let data = null;

  try {
    data = JSON.parse(rawText);
  } catch {
    throw createApiError("OpenRouter API error: non-JSON API response", 502);
  }

  if (!response.ok) {
    const message =
      data?.error?.message || data?.message || "OpenRouter request failed";
    throw createApiError(`OpenRouter API error: ${message}`, response.status);
  }

  return normalizeContent(data?.choices?.[0]?.message?.content);
};

const generateJSONPrompt = async (prompt) => {
  try {
    const apiKeys = getOpenRouterKeys();

    if (apiKeys.length === 0) {
      throw createApiError(
        "OpenRouter API error: OPEN_ROUTER_API_KEY1 to OPEN_ROUTER_API_KEY7 are missing"
      );
    }

    const attempts = [
      { temperature: 0.4, prompt },
      {
        temperature: 0.1,
        prompt: `${prompt}

Your previous response may have been invalid. Return one valid JSON object only. Do not include markdown, comments, or text outside JSON.`,
      },
    ];

    let lastContent = "";
    let lastError = null;

    for (let keyIndex = 0; keyIndex < apiKeys.length; keyIndex += 1) {
      const apiKey = apiKeys[keyIndex];

      for (const attempt of attempts) {
        try {
          lastContent = await callOpenRouter({
            apiKey,
            prompt: attempt.prompt,
            temperature: attempt.temperature,
          });

          const parsed = parseJSONSafely(lastContent);

          if (parsed) {
            return parsed;
          }

          lastError = createApiError(
            `OpenRouter API error: invalid JSON response from key ${keyIndex + 1}`
          );
        } catch (error) {
          lastError = error;
        }
      }

      console.warn(
        `OpenRouter key ${keyIndex + 1} failed after ${attempts.length} attempts. Trying next key.`
      );
    }

    console.error("OpenRouter invalid JSON content:", lastContent.slice(0, 500));
    throw createApiError(
      lastError?.message ||
        "OpenRouter API error: all configured keys failed",
      lastError?.statusCode || 502
    );
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
