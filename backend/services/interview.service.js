const mockDb = require("../data/mockDb");

const getReplyByMessage = (message) => {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("auth") || lowerMessage.includes("jwt")) {
    return {
      reply: "Can you explain how authentication works in your project?",
      feedback: "Good start. Add more details about JWT, sessions, and security.",
      score: 7,
    };
  }

  if (lowerMessage.includes("react") || lowerMessage.includes("frontend")) {
    return {
      reply: "How did you manage state and component re-rendering in your frontend?",
      feedback: "Mention state management, component structure, and performance choices.",
      score: 7,
    };
  }

  if (lowerMessage.includes("database") || lowerMessage.includes("mongodb")) {
    return {
      reply: "How did you design your database schema for this project?",
      feedback: "Explain collections, relationships, indexes, and why you chose that design.",
      score: 8,
    };
  }

  return {
    reply: "What was the hardest technical problem you solved in this project?",
    feedback: "Give a specific example, explain your approach, and share the final result.",
    score: 6,
  };
};

const generateInterviewReply = (role, message) => {
  const response = getReplyByMessage(message);

  mockDb.interviewHistory.push({
    role,
    message,
    response,
    createdAt: new Date().toISOString(),
  });

  return response;
};

module.exports = {
  generateInterviewReply,
};
