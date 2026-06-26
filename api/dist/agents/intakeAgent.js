"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runIntakeAgent = runIntakeAgent;
const qwenServices_1 = require("../services/qwenServices");
async function runIntakeAgent(jobDescription) {
    console.log("[IntakeAgent] Parsing job description...");
    const response = await (0, qwenServices_1.callQwen)([
        {
            role: "system",
            content: `You are the Intake Agent for TryB3, an autonomous recruitment platform.
Your job is to parse job descriptions and extract structured information.
Always respond with valid JSON only. No markdown, no explanation.`,
        },
        {
            role: "user",
            content: `Parse this job description and return a JSON object with these exact fields:
{
  "title": "job title",
  "seniority": "junior | mid | senior | lead | principal",
  "requiredSkills": ["skill1", "skill2"],
  "niceToHaveSkills": ["skill1"],
  "experienceYears": 3,
  "responsibilities": ["responsibility1"],
  "salaryRange": "if mentioned, otherwise null",
  "location": "if mentioned, otherwise null"
}

Job description:
${jobDescription}`,
        },
    ], "qwen-max", 800);
    try {
        const clean = response.content
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();
        const parsed = JSON.parse(clean);
        return { ...parsed, rawDescription: jobDescription };
    }
    catch {
        throw new Error("IntakeAgent failed to parse job description");
    }
}
