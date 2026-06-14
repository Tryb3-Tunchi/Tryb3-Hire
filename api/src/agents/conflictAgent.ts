import { callQwen } from "../services/qwenServices";

export interface ConflictInput {
  topic: string;
  positionA: { agentName: string; position: string; reasoning: string };
  positionB: { agentName: string; position: string; reasoning: string };
}

export interface ConflictResolution {
  winner: "A" | "B" | "compromise";
  decision: string;
  reasoning: string;
  reasoningTrace: string[];
  escalateToHuman: boolean;
  escalationReason?: string;
}

export async function runConflictAgent(
  conflict: ConflictInput,
): Promise<ConflictResolution> {
  console.log("[ConflictAgent] Mediating conflict:", conflict.topic);

  const response = await callQwen(
    [
      {
        role: "system",
        content: `You are the Conflict Resolution Agent for TryB3.
When agents disagree, you mediate and make final decisions.
You are objective, data-driven, and always explain your reasoning.
Always respond with valid JSON only. No markdown, no explanation.`,
      },
      {
        role: "user",
        content: `Mediate this conflict between two agents and return JSON:
{
  "winner": "A | B | compromise",
  "decision": "final decision statement",
  "reasoning": "why this decision was made",
  "reasoningTrace": ["step1", "step2", "step3"],
  "escalateToHuman": true or false,
  "escalationReason": "only if escalateToHuman is true"
}

TOPIC: ${conflict.topic}

AGENT ${conflict.positionA.agentName} says:
${conflict.positionA.position}
Reasoning: ${conflict.positionA.reasoning}

AGENT ${conflict.positionB.agentName} says:
${conflict.positionB.position}
Reasoning: ${conflict.positionB.reasoning}`,
      },
    ],
    "qwen-max",
    600,
  );

  try {
    const clean = response.content
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    return JSON.parse(clean);
  } catch {
    throw new Error("ConflictAgent failed to resolve conflict");
  }
}
