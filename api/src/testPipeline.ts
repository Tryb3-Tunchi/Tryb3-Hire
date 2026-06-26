import * as dotenv from "dotenv";
dotenv.config();

const test = async () => {
  const response = await fetch("http://localhost:4000/api/pipelines", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jobDescription:
        "We are looking for a Senior Frontend Engineer with at least 5 years of experience in React, TypeScript and Next.js. The candidate should have experience leading frontend teams and building scalable production applications at scale.",
    }),
  });

  const data = await response.json();
  console.log("Response:", JSON.stringify(data, null, 2));

  if (data.pipelineId) {
    console.log("\nPolling pipeline status in 5 seconds...");
    await new Promise(r => setTimeout(r, 5000));

    const poll = await fetch(
      `http://localhost:4000/api/pipelines/${data.pipelineId}`
    );
    const pipelineData = await poll.json();
    console.log("\nPipeline state:", JSON.stringify(pipelineData, null, 2));
  }
};

test().catch(console.error);