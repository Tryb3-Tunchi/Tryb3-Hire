import { Router, Request, Response } from "express";
import { runCoordinatorAgent } from "../agents/coordinatorAgent";

const router = Router();

const pipelines: Map<string, any> = new Map();

// Store scored candidates per pipeline
const pipelineCandidates: Map<string, any[]> = new Map();

router.post("/", async (req: Request, res: Response) => {
  try {
    const { jobDescription } = req.body as { jobDescription: string };

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
      currentStage: "intake" as const,
      requiresHumanApproval: false,
      log: [] as string[],
    };

    pipelines.set(pipelineId, initialState);
    pipelineCandidates.set(pipelineId, []);

    runCoordinatorAgent(initialState)
      .then((updated) => {
        pipelines.set(pipelineId, updated);
      })
      .catch(console.error);

    res.status(201).json({
      pipelineId,
      message: "Pipeline created — agents deploying",
      status: "intake",
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to create pipeline" });
  }
});

router.get("/", (req: Request, res: Response) => {
  const all = Array.from(pipelines.values()).map(p => ({
    ...p,
    candidates: pipelineCandidates.get(p.id) ?? [],
  }));
  res.json({ pipelines: all, total: all.length });
});

router.get("/:id", (req: Request, res: Response) => {
  const id = req.params.id as string;
  const pipeline = pipelines.get(id);

  if (!pipeline) {
    res.status(404).json({ error: "Pipeline not found" });
    return;
  }

  res.json({
    ...pipeline,
    candidates: pipelineCandidates.get(id) ?? [],
  });
});

// Add candidate to pipeline
router.post("/:id/candidates", (req: Request, res: Response) => {
  const id = req.params.id as string;
  const pipeline = pipelines.get(id);

  if (!pipeline) {
    res.status(404).json({ error: "Pipeline not found" });
    return;
  }

  if (pipeline.currentStage !== "sourcing") {
    res.status(400).json({
      error: `Cannot add candidates in ${pipeline.currentStage} stage. Must be in sourcing stage.`,
    });
    return;
  }

  const candidate = req.body;
  const candidates = pipelineCandidates.get(id) ?? [];
  candidates.push(candidate);
  pipelineCandidates.set(id, candidates);

  pipeline.log.push(
    `Sourcing Agent: Candidate ${candidate.name} scored ${candidate.score}/100 — ${candidate.recommendation}`
  );
  pipelines.set(id, pipeline);

  res.json({ message: "Candidate added", candidate });
});

// Human approval with strict validation
router.post("/:id/approve", (req: Request, res: Response) => {
  const id = req.params.id as string;
  const pipeline = pipelines.get(id);

  if (!pipeline) {
    res.status(404).json({ error: "Pipeline not found" });
    return;
  }

  if (!pipeline.requiresHumanApproval) {
    res.status(400).json({
      error: "This pipeline does not require approval right now",
    });
    return;
  }

  const candidates = pipelineCandidates.get(id) ?? [];

  // Strict validation per stage
  if (pipeline.currentStage === "sourcing") {
    if (candidates.length === 0) {
      res.status(400).json({
        error: "You must score at least one candidate before approving the sourcing stage",
      });
      return;
    }
  }

  const stageProgression: Record<string, string> = {
    market: "sourcing",
    sourcing: "screening",
    screening: "completed",
  };

  const nextStage = stageProgression[pipeline.currentStage];

  if (!nextStage) {
    res.status(400).json({ error: "No next stage available" });
    return;
  }

  pipeline.currentStage = nextStage;
  pipeline.requiresHumanApproval = false;
  pipeline.log.push(`Human: Approved — moving to ${nextStage}`);

  // Check if conflict is needed when moving to screening
  if (nextStage === "screening") {
    const flaggedCandidates = candidates.filter(
      (c: any) => c.score < 70 || c.recommendation === "maybe" || c.recommendation === "no"
    );

    if (flaggedCandidates.length > 0) {
      pipeline.log.push(
        `Conflict Agent: ${flaggedCandidates.length} candidate(s) flagged — running conflict resolution`
      );
      pipeline.conflictResolution = {
        flagged: flaggedCandidates.map((c: any) => ({
          name: c.name,
          score: c.score,
          reason: c.recommendation === "no" ? "Below threshold" : "Borderline score",
        })),
        resolved: true,
        decision: "Proceeding with high-scoring candidates only",
      };
      pipeline.log.push("Conflict Agent: Resolution complete — borderline candidates flagged for recruiter review");
    }
  }

  // Set screening approval requirement
  if (nextStage === "screening") {
    pipeline.requiresHumanApproval = true;
    pipeline.humanApprovalReason = "Screen candidates via chat, then approve final shortlist";
  }

  if (nextStage === "completed") {
    pipeline.log.push("Coordinator: Pipeline completed successfully");
  }

  pipelines.set(id, pipeline);

  res.json({
    message: "Approved",
    previousStage: Object.keys(stageProgression).find(
      k => stageProgression[k] === nextStage
    ),
    currentStage: nextStage,
    pipeline: { ...pipeline, candidates },
  });
});

export default router;