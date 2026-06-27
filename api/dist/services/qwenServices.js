"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.callQwen = callQwen;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const QWEN_BASE_URL = "https://ws-l5201xj4emlaw1j8.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1";
async function callQwen(messages, model = "qwen3.7-max", maxTokens = 1000) {
    const apiKey = process.env.QWEN_API_KEY;
    if (!apiKey) {
        throw new Error("QWEN_API_KEY not found in environment variables");
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
