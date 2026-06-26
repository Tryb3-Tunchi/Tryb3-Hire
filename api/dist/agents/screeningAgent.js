"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runScreeningAgent = runScreeningAgent;
const qwenServices_1 = require("../services/qwenServices");
async function runScreeningAgent(session, newMessage) {
    console.log(`[ScreeningAgent] Responding to candidate ${session.candidateId}...`);
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
    const messages = [
        { role: "system", content: systemPrompt },
        ...session.messages,
        { role: "user", content: newMessage },
    ];
    const response = await (0, qwenServices_1.callQwen)(messages, "qwen-plus", 500);
    // Extract memory from this exchange
    const memoryResponse = await (0, qwenServices_1.callQwen)([
        {
            role: "system",
            content: "Extract 1-2 key facts to remember about this candidate from this exchange. Be brief and factual. Return as a plain string.",
        },
        {
            role: "user",
            content: `Candidate said: "${newMessage}"\nAgent replied: "${response.content}"`,
        },
    ], "qwen-plus", 100);
    return {
        reply: response.content,
        updatedMemories: [...session.memories, memoryResponse.content],
    };
}
