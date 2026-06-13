import * as dotenv from "dotenv";
dotenv.config();

const testQwen = async () => {
  const response = await fetch(
    "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.QWEN_API_KEY}`,
      },
      body: JSON.stringify({
        model: "qwen-plus",
        messages: [{ role: "user", content: "say hello" }],
        max_tokens: 10,
      }),
    },
  );

  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
};

testQwen();
