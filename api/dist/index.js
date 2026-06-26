"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const pipeline_1 = __importDefault(require("./routes/pipeline"));
const candidates_1 = __importDefault(require("./routes/candidates"));
const screening_1 = __importDefault(require("./routes/screening"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        service: "TryB3 API",
        version: "1.0.0",
        qwenConfigured: !!process.env.QWEN_API_KEY,
        timestamp: new Date().toISOString(),
    });
});
app.use("/api/pipelines", pipeline_1.default);
app.use("/api/candidates", candidates_1.default);
app.use("/api/screening", screening_1.default);
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
