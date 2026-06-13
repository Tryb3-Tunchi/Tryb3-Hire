import { create } from "zustand";
import { Pipeline } from "../types";

interface PipelineStore {
  pipelines: Pipeline[];
  activePipelineId: string | null;
  setActivePipeline: (id: string) => void;
  addPipeline: (pipeline: Pipeline) => void;
}

export const usePipelineStore = create<PipelineStore>((set) => ({
  pipelines: [],
  activePipelineId: null,

  setActivePipeline: (id) => set({ activePipelineId: id }),

  addPipeline: (pipeline) =>
    set((state) => ({
      pipelines: [...state.pipelines, pipeline],
    })),
}));