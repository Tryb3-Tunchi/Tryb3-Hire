import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pipelineRoutes from "./routes/pipeline";
import candidateRoutes from "./routes/candidates";
import screeningRoutes from "./routes/screening";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "TryB3 API",
    version: "1.0.0",
    qwenConfigured: !!process.env.QWEN_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/pipelines", pipelineRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/screening", screeningRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`
  ✓ TryB3 API running on port ${PORT}
  ✓ Health: http://localhost:${PORT}/health
  ✓ Qwen configured: ${!!process.env.QWEN_API_KEY}
  `);
});