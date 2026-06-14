import { callQwen, QwenMessage } from "../services/qwenServices";

export interface ScreeningSession {
  candidateId: string;
  messages: QwenMessage[];
  memories: string[];
}

export async function runScreeningAgent(
  session: ScreeningSession,
  newMessage: string,
): Promise<{ reply: string; updatedMemories: string[] }> {
  console.log(
    `[ScreeningAgent] Responding to candidate ${session.candidateId}...`,
  );

  const systemPrompt = `You are the Screening Agent for TryB3.
You conduct professional recruitment screening conversations.
You remember previous sessions with this candidate.

Previous memories about this candidate:
${session.memories.length > 0 ? session.memories.join("\n") : "No previous sessions"}

Be professional, ask one question at a time, and assess:
- Communication skills
- Technical depth
- Culture fit signals
- Any inconsistencies with their profile`;

  const messages: QwenMessage[] = [
    { role: "system", content: systemPrompt },
    ...session.messages,
    { role: "user", content: newMessage },
  ];

  const response = await callQwen(messages, "qwen-plus", 500);

  // Extract memory from this exchange
  const memoryResponse = await callQwen(
    [
      {
        role: "system",
        content:
          "Extract 1-2 key facts to remember about this candidate from this exchange. Be brief and factual. Return as a plain string.",
      },
      {
        role: "user",
        content: `Candidate said: "${newMessage}"\nAgent replied: "${response.content}"`,
      },
    ],
    "qwen-plus",
    100,
  );

  return {
    reply: response.content,
    updatedMemories: [...session.memories, memoryResponse.content],
  };
}
