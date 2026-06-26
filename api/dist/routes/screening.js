"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const screeningAgent_1 = require("../agents/screeningAgent");
const router = (0, express_1.Router)();
const sessions = new Map();
router.post("/:candidateId/message", async (req, res) => {
    try {
        const candidateId = req.params.candidateId;
        const { message } = req.body;
        if (!message) {
            res.status(400).json({ error: "message is required" });
            return;
        }
        const existingSession = sessions.get(candidateId);
        const session = existingSession ?? {
            candidateId,
            messages: [],
            memories: [],
        };
        const result = await (0, screeningAgent_1.runScreeningAgent)(session, message);
        const updatedSession = {
            candidateId,
            messages: [
                ...session.messages,
                { role: "user", content: message },
                { role: "assistant", content: result.reply },
            ],
            memories: result.updatedMemories,
        };
        sessions.set(candidateId, updatedSession);
        res.json({
            reply: result.reply,
            memoriesCount: result.updatedMemories.length,
        });
    }
    catch (error) {
        res.status(500).json({ error: "Screening failed" });
    }
});
router.get("/:candidateId/session", (req, res) => {
    const candidateId = req.params.candidateId;
    const session = sessions.get(candidateId);
    if (!session) {
        res.status(404).json({ error: "No session found" });
        return;
    }
    res.json(session);
});
exports.default = router;
