import { Router, Request, Response } from "express";
import { runSourcingAgent } from "../agents/sourcingAgent";
import { JobSpec } from "../agents/intakeAgent";
import { runConflictAgent } from "../agents/conflictAgent";

const router = Router();

// Score a candidate against a job spec
router.post("/score", async (req: Request, res: Response) => {
  try {
    const { candidate, jobSpec } = req.body as {
      candidate: { id: string; name: string; profile: string };
      jobSpec: JobSpec;
    };

    if (!candidate || !jobSpec) {
      return res.status(400).json({
        error: "candidate and jobSpec are required",
      });
    }

    const result = await runSourcingAgent(candidate, jobSpec);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: "Scoring failed" });
  }
});

router.post("/conflict", async (req: Request, res: Response) => {
  try {
    const { conflict } = req.body;

    if (!conflict) {
      res.status(400).json({ error: "conflict object is required" });
      return;
    }

    const resolution = await runConflictAgent(conflict);
    res.json(resolution);
  } catch (error) {
    res.status(500).json({ error: "Conflict resolution failed" });
  }
});

export default router;
