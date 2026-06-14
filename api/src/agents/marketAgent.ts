import { callQwen } from "../services/qwenServices";
import { JobSpec } from "./intakeAgent";

export interface MarketIntelligence {
  salaryRange: { min: number; max: number; currency: string };
  talentSupply: "scarce" | "moderate" | "abundant";
  averageTimeToHire: string;
  topCompetitors: string[];
  inDemandSkills: string[];
  marketSummary: string;
  reasoningTrace: string[];
}

export async function runMarketAgent(
  jobSpec: JobSpec,
): Promise<MarketIntelligence> {
  console.log("[MarketAgent] Researching talent market...");

  const response = await callQwen(
    [
      {
        role: "system",
        content: `You are the Market Intelligence Agent for TryB3.
You analyze talent markets and provide hiring intelligence.
Always respond with valid JSON only. No markdown, no explanation.`,
      },
      {
        role: "user",
        content: `Analyze the talent market for this role and return JSON:
{
  "salaryRange": { "min": 0, "max": 0, "currency": "USD" },
  "talentSupply": "scarce | moderate | abundant",
  "averageTimeToHire": "e.g. 3-4 weeks",
  "topCompetitors": ["company1", "company2"],
  "inDemandSkills": ["skill1", "skill2"],
  "marketSummary": "2-3 sentence market overview",
  "reasoningTrace": [
    "Step 1: ...",
    "Step 2: ..."
  ]
}

Role: ${jobSpec.title}
Seniority: ${jobSpec.seniority}
Required skills: ${jobSpec.requiredSkills.join(", ")}
Location: ${jobSpec.location ?? "Remote"}`,
      },
    ],
    "qwen-max",
    800,
  );

  try {
    const clean = response.content
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    return JSON.parse(clean);
  } catch {
    throw new Error("MarketAgent failed to parse response");
  }
}
