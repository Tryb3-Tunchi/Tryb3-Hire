"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const test = async () => {
    const response = await fetch("http://localhost:4000/api/pipelines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            jobDescription: "We are looking for a Senior Frontend Engineer with at least 5 years of experience in React, TypeScript and Next.js. The candidate should have experience leading frontend teams and building scalable production applications at scale.",
        }),
    });
    const data = await response.json();
    console.log("Response:", JSON.stringify(data, null, 2));
    if (data.pipelineId) {
        console.log("\nPolling pipeline status in 5 seconds...");
        await new Promise(r => setTimeout(r, 5000));
        const poll = await fetch(`http://localhost:4000/api/pipelines/${data.pipelineId}`);
        const pipelineData = await poll.json();
        console.log("\nPipeline state:", JSON.stringify(pipelineData, null, 2));
    }
};
test().catch(console.error);
