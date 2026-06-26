import * as dotenv from "dotenv";
dotenv.config();

const BASE_URL =
  process.env.QWEN_BASE_URL ||
  "https://ws-l5201xj4emlaw1j8.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1";

const testQwen = async () => {
  console.log("Testing Qwen API...");
  console.log("URL:", BASE_URL);

  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.QWEN_API_KEY}`,
    },
    body: JSON.stringify({
      model: "qwen3.7-max",
      messages: [{ role: "user", content: "Say hello in one sentence." }],
      max_tokens: 50,
      stream: false,
    }),
  });

  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
};

testQwen().catch(console.error);