import dotenv from "dotenv";
dotenv.config();

const QWEN_BASE_URL =
  "https://ws-l5201xj4emlaw1j8.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1";

const QWEN_API_KEY =
  process.env.QWEN_API_KEY ||
  "sk-ws-H.LHEDDM.xvgI.MEYCIQDxxwoziOJx11yXj_iQpivC2ijCg97iSeFzptwi_O8lZAIhAO1lDOy7sB770MzGCuLZ05zT-ocs9p6Fatr-Q_qi5UvX";

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
  maxTokens = 1000,
): Promise<QwenResponse> {
  const response = await fetch(`${QWEN_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${QWEN_API_KEY}`,
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
