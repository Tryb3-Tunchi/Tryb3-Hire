import { Router, Request, Response } from "express";
import { runScreeningAgent, ScreeningSession } from "../agents/screeningAgent";

const router = Router();

const sessions: Map<string, ScreeningSession> = new Map();

router.post("/:candidateId/message", async (req: Request, res: Response) => {
  try {
    const candidateId = req.params.candidateId as string;
    const { message } = req.body as { message: string };

    if (!message) {
      res.status(400).json({ error: "message is required" });
      return;
    }

    const existingSession = sessions.get(candidateId);

    const session: ScreeningSession = existingSession ?? {
      candidateId,
      messages: [],
      memories: [],
    };

    const result = await runScreeningAgent(session, message);

    const updatedSession: ScreeningSession = {
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
  } catch (error) {
    res.status(500).json({ error: "Screening failed" });
  }
});

router.get("/:candidateId/session", (req: Request, res: Response) => {
  const candidateId = req.params.candidateId as string;
  const session = sessions.get(candidateId);

  if (!session) {
    res.status(404).json({ error: "No session found" });
    return;
  }

  res.json(session);
});

export default router;