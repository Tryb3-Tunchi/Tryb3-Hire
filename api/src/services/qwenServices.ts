import dotenv from "dotenv";
dotenv.config();

const QWEN_BASE_URL = "https://ws-l5201xj4emlaw1j8.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1";

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
  model = "qwen3.7-max",
  maxTokens = 1000
): Promise<QwenResponse> {
  const apiKey = process.env.QWEN_API_KEY;

  if (!apiKey) {
    throw new Error("QWEN_API_KEY not set in environment");
  }

  const response = await fetch(`${QWEN_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: maxTokens,
      stream: false,
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