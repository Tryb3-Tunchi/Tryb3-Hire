"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api/client";

export interface LivePipelineState {
  id: string;
  jobDescription: string;
  jobSpec?: {
    title: string;
    seniority: string;
    requiredSkills: string[];
  };
  currentStage: string;
  requiresHumanApproval: boolean;
  humanApprovalReason?: string;
  log: string[];
}

export function usePipelinePolling(pipelineId: string | null) {
  const [pipeline, setPipeline] = useState<LivePipelineState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!pipelineId) return;

    setLoading(true);

    const poll = async () => {
      try {
        const data = await api.getPipeline(pipelineId);
        setPipeline(data);
        setError(null);

        if (
          data.currentStage === "completed" ||
          data.requiresHumanApproval
        ) {
          clearInterval(interval);
          setLoading(false);
        }
      } catch {
        setError("Failed to fetch pipeline status");
        setLoading(false);
      }
    };

    poll();
    const interval = setInterval(poll, 3000);

    return () => clearInterval(interval);
  }, [pipelineId]);

  return { pipeline, loading, error };
}