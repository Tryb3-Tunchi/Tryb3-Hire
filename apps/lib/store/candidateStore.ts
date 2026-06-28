import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ScoredCandidate {
  id: string;
  name: string;
  email: string;
  score: number;
  confidence: number;
  recommendation: string;
  strengths: string[];
  gaps: string[];
  reasoningTrace: string[];
  stage: "sourced" | "screened" | "shortlisted" | "interview" | "decision";
  pipelineId: string;
  jobTitle: string;
}

interface CandidateStore {
  candidates: ScoredCandidate[];
  addCandidate: (candidate: ScoredCandidate) => void;
  updateStage: (id: string, stage: ScoredCandidate["stage"]) => void;
  clearAll: () => void;
}

export const useCandidateStore = create<CandidateStore>()(
  persist(
    (set) => ({
      candidates: [],
      addCandidate: (candidate) =>
        set((state) => ({
          candidates: [...state.candidates, candidate],
        })),
      updateStage: (id, stage) =>
        set((state) => ({
          candidates: state.candidates.map((c) =>
            c.id === id ? { ...c, stage } : c
          ),
        })),
      clearAll: () => set({ candidates: [] }),
    }),
    {
      name: "tryb3-candidates",
    }
  )
);