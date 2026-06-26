"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const coordinatorAgent_1 = require("../agents/coordinatorAgent");
const router = (0, express_1.Router)();
const pipelines = new Map();
router.post("/", async (req, res) => {
    try {
        const { jobDescription } = req.body;
        if (!jobDescription || jobDescription.trim().length < 50) {
            res.status(400).json({
                error: "Job description must be at least 50 characters",
            });
            return;
        }
        const pipelineId = `pipe-${Date.now()}`;
        const initialState = {
            id: pipelineId,
            jobDescription,
            currentStage: "intake",
            requiresHumanApproval: false,
            log: [],
        };
        pipelines.set(pipelineId, initialState);
        (0, coordinatorAgent_1.runCoordinatorAgent)(initialState)
            .then((updated) => {
            pipelines.set(pipelineId, updated);
            console.log(`[Pipeline] ${pipelineId} updated — stage: ${updated.currentStage}`);
        })
            .catch((err) => {
            console.error(`[Pipeline] ${pipelineId} failed:`, err);
        });
        res.status(201).json({
            pipelineId,
            message: "Pipeline created — agents deploying",
            status: "intake",
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create pipeline" });
    }
});
router.get("/", (req, res) => {
    const all = Array.from(pipelines.values());
    res.json({ pipelines: all, total: all.length });
});
router.get("/:id", (req, res) => {
    const id = req.params.id;
    const pipeline = pipelines.get(id);
    if (!pipeline) {
        res.status(404).json({ error: "Pipeline not found" });
        return;
    }
    res.json(pipeline);
});
router.post("/:id/approve", (req, res) => {
    const id = req.params.id;
    const pipeline = pipelines.get(id);
    if (!pipeline) {
        res.status(404).json({ error: "Pipeline not found" });
        return;
    }
    pipeline.requiresHumanApproval = false;
    pipeline.log.push("Human: Approved — pipeline continuing");
    pipelines.set(id, pipeline);
    res.json({ message: "Approved", pipeline });
});
exports.default = router;
