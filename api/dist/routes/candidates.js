"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sourcingAgent_1 = require("../agents/sourcingAgent");
const conflictAgent_1 = require("../agents/conflictAgent");
const router = (0, express_1.Router)();
// Score a candidate against a job spec
router.post("/score", async (req, res) => {
    try {
        const { candidate, jobSpec } = req.body;
        if (!candidate || !jobSpec) {
            return res.status(400).json({
                error: "candidate and jobSpec are required",
            });
        }
        const result = await (0, sourcingAgent_1.runSourcingAgent)(candidate, jobSpec);
        return res.json(result);
    }
    catch (error) {
        return res.status(500).json({ error: "Scoring failed" });
    }
});
router.post("/conflict", async (req, res) => {
    try {
        const { conflict } = req.body;
        if (!conflict) {
            res.status(400).json({ error: "conflict object is required" });
            return;
        }
        const resolution = await (0, conflictAgent_1.runConflictAgent)(conflict);
        res.json(resolution);
    }
    catch (error) {
        res.status(500).json({ error: "Conflict resolution failed" });
    }
});
exports.default = router;
