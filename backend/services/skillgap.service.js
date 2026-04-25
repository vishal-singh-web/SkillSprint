const baseDaily3 = [
  "Solve 2 DSA problems",
  "Improve one project README",
  "Apply to 3 internships",
];

const skillKeywords = [
  { name: "React", keywords: ["react", "jsx", "component", "redux"] },
  { name: "Node.js", keywords: ["node", "node.js", "express", "api"] },
  { name: "MongoDB", keywords: ["mongodb", "mongoose", "database"] },
  { name: "Authentication", keywords: ["auth", "authentication", "jwt", "login"] },
  { name: "JavaScript", keywords: ["javascript", "js", "es6"] },
  { name: "REST APIs", keywords: ["rest", "rest api", "crud", "endpoint"] },
];

const expectedSkills = [
  "System Design",
  "AI APIs",
  "DBMS",
  "Operating Systems",
  "DSA",
  "Cloud Deployment",
];

const analyzeResumeText = (resumeText) => {
  const lowerText = resumeText.toLowerCase();

  const strengths = skillKeywords
    .filter((skill) =>
      skill.keywords.some((keyword) => lowerText.includes(keyword))
    )
    .map((skill) => skill.name);

  const missingSkills = expectedSkills.filter(
    (skill) => !lowerText.includes(skill.toLowerCase())
  );

  const recommendedRoadmap = [
    "Build one AI-powered project",
    "Practice REST API design",
    "Revise DBMS and OS basics",
  ];

  return {
    strengths: strengths.length > 0 ? strengths : ["Problem Solving"],
    missingSkills: missingSkills.slice(0, 4),
    recommendedRoadmap,
    daily3: baseDaily3,
  };
};

module.exports = {
  analyzeResumeText,
};
