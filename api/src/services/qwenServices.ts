import dotenv from "dotenv";
dotenv.config();

const QWEN_BASE_URL =
  "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";

export interface QwenMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface QwenResponse {
  content: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
  };
}

export async function callQwen(
  messages: QwenMessage[],
  model: "qwen-max" | "qwen-plus" | "qwen-vl-plus" = "qwen-plus",
  maxTokens: number = 1000
): Promise<QwenResponse> {
  const response = await fetch(QWEN_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.QWEN_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Qwen API error: ${JSON.stringify(error)}`);
  }

  const data = await response.json();

  return {
    content: data.choices[0].message.content,
    usage: data.usage,
  };
}