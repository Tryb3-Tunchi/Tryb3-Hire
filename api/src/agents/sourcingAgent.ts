import { callQwen } from "../services/qwenServices";
import { JobSpec } from "./intakeAgent";

export interface CandidateScore {
  candidateId: string;
  name: string;
  score: number;
  confidence: number;
  reasoningTrace: string[];
  strengths: string[];
  gaps: string[];
  recommendation: "strong_yes" | "yes" | "maybe" | "no";
}

export async function runSourcingAgent(
  candidate: { id: string; name: string; profile: string },
  jobSpec: JobSpec,
): Promise<CandidateScore> {
  console.log(`[SourcingAgent] Scoring candidate ${candidate.name}...`);

  const response = await callQwen(
    [
      {
        role: "system",
        content: `You are the Sourcing and Scoring Agent for TryB3.
You evaluate candidates against job specifications with detailed reasoning.
Always respond with valid JSON only. No markdown, no explanation.`,
      },
      {
        role: "user",
        content: `Score this candidate against the job spec.

JOB SPEC:
${JSON.stringify(jobSpec, null, 2)}

CANDIDATE PROFILE:
${candidate.profile}

Return JSON:
{
  "score": 0-100,
  "confidence": 0-100,
  "reasoningTrace": [
    "Step by step reasoning lines",
    "Each line is one reasoning step"
  ],
  "strengths": ["strength1", "strength2"],
  "gaps": ["gap1", "gap2"],
  "recommendation": "strong_yes | yes | maybe | no"
}`,
      },
    ],
    "qwen-max",
    1000,
  );

  try {
    const clean = response.content
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    const parsed = JSON.parse(clean);
    return {
      candidateId: candidate.id,
      name: candidate.name,
      ...parsed,
    };
  } catch {
    throw new Error("SourcingAgent failed to score candidate");
  }
}
