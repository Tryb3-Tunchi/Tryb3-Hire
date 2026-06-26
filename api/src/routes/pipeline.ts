import { Router, Request, Response } from "express";
import { runCoordinatorAgent } from "../agents/coordinatorAgent";

const router = Router();

const pipelines: Map<string, any> = new Map();

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

    runCoordinatorAgent(initialState)
      .then((updated) => {
        pipelines.set(pipelineId, updated);
        console.log(
          `[Pipeline] ${pipelineId} updated — stage: ${updated.currentStage}`,
        );
      })
      .catch((err) => {
        console.error(`[Pipeline] ${pipelineId} failed:`, err);
      });

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
  const all = Array.from(pipelines.values());
  res.json({ pipelines: all, total: all.length });
});

router.get("/:id", (req: Request, res: Response) => {
  const id = req.params.id as string;
  const pipeline = pipelines.get(id);

  if (!pipeline) {
    res.status(404).json({ error: "Pipeline not found" });
    return;
  }

  res.json(pipeline);
});

router.post("/:id/approve", (req: Request, res: Response) => {
  const id = req.params.id as string;
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

export default router;
